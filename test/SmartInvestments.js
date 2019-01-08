const BigNumber = web3.BigNumber;
const BN = BigNumber;
const expect = require('chai').expect;
const should = require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bignumber')(web3.BigNumber))
    .should();

import expectThrow from './helpers/expectThrow';

var SmartInvestments = artifacts.require('./SmartInvestments');

const minute = 60;
const hour = 60 * minute;
const setNextBlockDelay = function(duration) {
    const id = Date.now()

    return new Promise((resolve, reject) => {
        web3.currentProvider.sendAsync({
            jsonrpc: '2.0',
            method: 'evm_increaseTime',
            params: [duration],
            id: id,
        }, err1 => {
            if (err1) return reject(err1)

            web3.currentProvider.sendAsync({
                jsonrpc: '2.0',
                method: 'evm_mine',
                id: id+1,
            }, (err2, res) => {
                return err2 ? reject(err2) : resolve(res)
            })
        })
    })
}


function getProgram(program) {
    if (program == undefined)
        return undefined;

    return {
        minSum: program[0].toNumber(),
        income: program[1].toNumber()
    }
}

function getInvestor(investor) {
    if (investor == undefined)
        return undefined;

    return {
        lastWithdraw: investor[0].toNumber(),
        totalSum: investor[1].toString(),
        totalWithdraw: investor[2].toString(),
        totalReferralIncome: investor[3].toString(),
        referrersByLevel: investor[4].map(x => x.toNumber()),
        myLvOneReferralsIds: investor[5].map(x => x)
    }
}

function weiToEther(wei) {
    return web3.fromWei(wei, 'ether');
}

contract('SmartInvestments', function(accounts) {
    let smartInvestments;

    const owner = accounts[0];
    const user0 = accounts[1];
    const gasPrice = web3.toWei('15', 'gwei');

    async function referralsDepositTests(sumInvest1, targetSum) {
        let investorIndex1 = 1;
        let investorIndex2 = 2;
        let investorIndex3 = 3;
        let investorIndex4 = 4;
        let investorIndex5 = 5;
        let investorIndex6 = 6;
        let sum = web3.toWei(sumInvest1, 'ether');
        let oneEther = web3.toWei(1, 'ether');

        await smartInvestments.deposit(0, {from: accounts[1], value: sum});
        let user0_balance_start = web3.eth.getBalance(accounts[1]);

        await smartInvestments.deposit(investorIndex1, {from: accounts[2], value: oneEther});
        await smartInvestments.deposit(investorIndex2, {from: accounts[3], value: oneEther});
        await smartInvestments.deposit(investorIndex3, {from: accounts[4], value: oneEther});
        await smartInvestments.deposit(investorIndex4, {from: accounts[5], value: oneEther});
        await smartInvestments.deposit(investorIndex5, {from: accounts[6], value: oneEther});

        let user0_balance = web3.eth.getBalance(accounts[1]);
        let profit = user0_balance.minus(user0_balance_start);
        let targetProfit = new BN(oneEther).mul(targetSum);

        let investor1 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex1));
        let investor2 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex2));
        let investor3 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex3));
        let investor4 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex4));
        let investor5 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex5));
        let investor6 = getInvestor(await smartInvestments.getInvestorInfo(investorIndex6));

        let info = {
            investorsData: [investor1, investor2, investor3, investor4, investor5, investor6],
            invester1_BalanceStart: weiToEther(user0_balance_start.toString()),
            invester1_BalanceAfter: weiToEther(user0_balance.toString()),
            profit: weiToEther(profit.toString()),
            targetProfit: weiToEther(targetProfit.toString()),
            totalReferralIncome: weiToEther(investor1.totalReferralIncome.toString())
        }

        console.log('\n------------------------------')
        console.log('investor1', investor1);
        console.log('info', info);
        console.log('\n');

        expect(info.profit).to.equal(info.targetProfit);
        expect(info.totalReferralIncome).to.equal(info.targetProfit);
    }

    beforeEach('setup contract for each test', async function () {
        smartInvestments = await SmartInvestments.new({from: owner});
    });

    it('has an owner', async function () {
        expect(await smartInvestments.owner()).to.equal(owner);
    });

    it('first deposit', async function () {
        let investorId0 = 1;
        let sum = web3.toWei(1, 'gwei');

        await smartInvestments.deposit(0, {from: user0, value: sum});
        let investor0 = getInvestor(await smartInvestments.getInvestorInfo(investorId0));

        expect(investor0.totalSum).to.equal(sum);
    });

    it('referrals deposit bonus for investor sum >= 0.01 and < 10', async function () {
        await referralsDepositTests(0.01, '0.05');
    });

    it('referrals deposit bonus for investor sum >= 10 and < 100', async function () {
        await referralsDepositTests(10, '0.10');
    });

    it('referrals deposit bonus for investor sum >= 100', async function () {
        await referralsDepositTests(100, '0.15');
    });

    it('withdraw amount', async function () {
        let programsCount = (await smartInvestments.programsCount()).toNumber();
        var programs = [];

        // collect all programs
        for (var i = 0; i < programsCount; i++) {
            programs.push(getProgram(await smartInvestments.getProgramInfo(i)));
        }

        for (var i = 0; i < programsCount; i++) {
            let program = programs[i];

            await smartInvestments.deposit(0, {from: accounts[i], value: program.minSum});

            await setNextBlockDelay(hour);
            let amount = await smartInvestments.withdrawAmount({from: accounts[i]});
            let amountYear = amount.mul(8760);
            let targetHour = new BigNumber(program.minSum).mul(program.income / 100).div(8760).round();

            let info = {
                minSum: weiToEther(program.minSum),
                programIncome: program.income,

                withdrawHour: weiToEther(amount.toString()),
                withdrawYear: weiToEther(amountYear.toString()),
                withdrawYearIncome: amountYear.div(new BN(program.minSum)).mul(100).toString(),

                targetHour: weiToEther(targetHour.toString()),
                targetYear: weiToEther(targetHour.mul(8760).toString()),
                targetYearIncome: targetHour.mul(8760).div(new BN(program.minSum)).mul(100).toString()
            };

            console.log(info);

            expect(info.withdrawHour).to.equal(info.targetHour);
        }
    });

    it('withdraw all levels', async function () {
        smartInvestments = await SmartInvestments.new({from: accounts[30], value: web3.toWei(100000, 'ether')});

        let programsCount = (await smartInvestments.programsCount()).toNumber();
        var programs = [];

        // collect all programs
        for (var i = 0; i < programsCount; i++)
            programs.push(getProgram(await smartInvestments.getProgramInfo(i)));

        let testDeposit = new BN(0);
        let testWithdraw = new BN(0);

        for (var i = 0; i < programsCount; i++) {
            let program = programs[i];

            await smartInvestments.deposit(0, {from: accounts[i], value: program.minSum});
            testDeposit = testDeposit.plus(program.minSum);
            let user0_balance_start = web3.eth.getBalance(accounts[i]);

            await setNextBlockDelay(hour);
            let withdrawResult = await smartInvestments.withdraw({from: accounts[i]});
            let user0_balance = web3.eth.getBalance(accounts[i]);
            let profit = new BigNumber(user0_balance).minus(user0_balance_start).plus(withdrawResult.receipt.gasUsed);
            let targetProfit = new BigNumber(program.minSum).mul(program.income / 100).div(8760).round();
            testWithdraw = testWithdraw.plus(targetProfit);

            let investorId = await smartInvestments.getInvestorId(accounts[i], {from: accounts[i]});
            let investor = getInvestor(await smartInvestments.getInvestorInfo(investorId));

            let info = {
                investorId: investorId,
                investor: investor,
                minSum: weiToEther(program.minSum.toString()),
                income: program.income,
                startBalance: weiToEther(user0_balance.toString()),
                afterBalance: weiToEther(user0_balance_start.toString()),
                profit: (weiToEther(profit.toString()) + ''),
                targetProfit: (weiToEther(targetProfit.toString()) + '')
            }

            console.log(info);

            expect(info.profit).to.equal(info.targetProfit);
            expect(investor.totalWithdraw).to.equal(targetProfit.toString());
        }

        let globalDeposit = await smartInvestments.globalDeposit();
        console.log('globalDeposit', weiToEther(globalDeposit.toString()));
        console.log('testDeposit',  weiToEther(testDeposit.toString()));
        let globalWithdraw = await smartInvestments.globalWithdraw();
        console.log('globalWithdraw', weiToEther(globalWithdraw.toString()));
        console.log('testWithdraw', weiToEther(testWithdraw.toString()));

        expect(weiToEther(globalDeposit.toString())).to.equal(weiToEther(testDeposit.toString()));
        expect(weiToEther(globalWithdraw.toString())).to.equal(weiToEther(testWithdraw.toString()));
    });

    it('withdraw on zero deposit', async function () {
        let oneEther = web3.toWei(1, 'ether');
        let incomeForOneEther = 204;
        await smartInvestments.deposit(0, {from: accounts[1], value: oneEther});
        let user0_balance_start = web3.eth.getBalance(accounts[1]);

        await setNextBlockDelay(hour * 24);
        let result = await smartInvestments.sendTransaction({from: accounts[1], value: 0});
        let user0_balance = web3.eth.getBalance(accounts[1]);
        let profit = new BigNumber(user0_balance).minus(user0_balance_start).plus(result.receipt.gasUsed);
        let targetProfit = new BigNumber(oneEther).mul(incomeForOneEther / 100).div(365).round();

        let info = {
            profit: (weiToEther(profit.toString()) + ''),
            targetProfit: (weiToEther(targetProfit.toString()) + '')
        };

        console.log(info);

        expect(info.profit).to.equal(info.targetProfit);
    });

    it('withdraw buffer test', async function () {
        let oneEther = web3.toWei(1, 'ether');
        let income = 204;
        let investorId, investor, withdrawAmount, depositTargetProfit;

        // income 204
        await smartInvestments.deposit(0, {from: accounts[1], value: oneEther});
        await setNextBlockDelay(hour);
        investorId = await smartInvestments.getInvestorId(accounts[1], {from: accounts[1]});
        let deposit1_targetProfit = new BigNumber(oneEther).mul(income).div(8760).div(100).round();

        withdrawAmount = weiToEther((await smartInvestments.withdrawAmount({from: accounts[1]})).toString());
        depositTargetProfit = weiToEther(deposit1_targetProfit.toString());
        console.log('------');
        console.log('withdraw ------ amount', withdrawAmount);
        console.log('deposits target profit', depositTargetProfit);
        expect(withdrawAmount.replace(/^\d\.(\d{12}).*$/, '$1')).to.equal(depositTargetProfit.replace(/^\d\.(\d{12}).*$/, '$1'));

        // income 216
        income = 216;
        await smartInvestments.deposit(0, {from: accounts[1], value: oneEther});
        await setNextBlockDelay(hour);
        deposit1_targetProfit = deposit1_targetProfit.plus( new BigNumber(oneEther).mul(income).div(8760).div(100).round() );
        let deposit2_targetProfit = new BigNumber(oneEther).mul(income).div(8760).div(100).round()

        withdrawAmount = weiToEther((await smartInvestments.withdrawAmount({from: accounts[1]})).toString());
        depositTargetProfit = weiToEther(deposit1_targetProfit.plus(deposit2_targetProfit).toString());
        console.log('------');
        console.log('withdraw ------ amount', withdrawAmount);
        console.log('deposits target profit', depositTargetProfit);
        expect(withdrawAmount.replace(/^\d\.(\d{12}).*$/, '$1')).to.equal(depositTargetProfit.replace(/^\d\.(\d{12}).*$/, '$1'));

        // income 228
        income = 228;
        await smartInvestments.deposit(0, {from: accounts[1], value: oneEther});
        await setNextBlockDelay(hour);
        deposit1_targetProfit = deposit1_targetProfit.plus( new BigNumber(oneEther).mul(income).div(8760).div(100).round() );
        deposit2_targetProfit = deposit2_targetProfit.plus( new BigNumber(oneEther).mul(income).div(8760).div(100).round() );
        let deposit3_targetProfit = new BigNumber(oneEther).mul(income).div(8760).div(100).round();

        withdrawAmount = weiToEther((await smartInvestments.withdrawAmount({from: accounts[1]})).toString());
        depositTargetProfit = weiToEther(deposit1_targetProfit.plus(deposit2_targetProfit).plus(deposit3_targetProfit).toString())
        console.log('------');
        console.log('withdraw ------ amount', withdrawAmount);
        console.log('deposits target profit', depositTargetProfit);
        expect(withdrawAmount.replace(/^\d\.(\d{12}).*$/, '$1')).to.equal(depositTargetProfit.replace(/^\d\.(\d{12}).*$/, '$1'));

        /**
         *
         */

        await smartInvestments.withdraw({from: accounts[1]});
        investor = getInvestor(await smartInvestments.getInvestorInfo(investorId));
        console.log(weiToEther(investor.totalWithdraw));

        let totalDepositTargetProfit = deposit1_targetProfit.plus(deposit2_targetProfit).plus(deposit3_targetProfit);

        let info = {
            investor: investor,
            totalSum: weiToEther(investor.totalSum),
            deposit1_targetProfit: weiToEther(deposit1_targetProfit.toString()),
            deposit2_targetProfit: weiToEther(deposit2_targetProfit.toString()),
            deposit3_targetProfit: weiToEther(deposit3_targetProfit.toString()),
            depositsTargetProfit_: weiToEther(totalDepositTargetProfit.toString()),
            investorTotalWithdraw: weiToEther(investor.totalWithdraw)
        };

        console.log('---------');
        console.log(info);

        expect(info.depositsTargetProfit_.replace(/^\d\.(\d{12}).*$/, '$1')).to.equal(info.investorTotalWithdraw.replace(/^\d\.(\d{12}).*$/, '$1'));
    });
});
