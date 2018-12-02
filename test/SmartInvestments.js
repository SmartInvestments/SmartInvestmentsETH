const BigNumber = web3.BigNumber;
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
        level: investor[0].toNumber(),
        lastWithdraw: investor[1].toNumber(),
        totalSum: investor[2].toString(),
        referrersByLevel: investor[3].map(x => x.toNumber())
    }
}

contract('SmartInvestments', function(accounts) {
    let smartInvestments;

    const owner = accounts[0];
    const user0 = accounts[1];
    const user1 = accounts[2];
    const user2 = accounts[3];
    const user3 = accounts[4];

    const gasPrice = web3.toWei('15', 'gwei');

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

    it('referral deposit', async function () {
        let investorId0 = 1;
        let investorId1 = 2;
        let sum = web3.toWei(0.01, 'ether');
        let sum0 = web3.toWei(1, 'ether');

        await smartInvestments.deposit(0, {from: user0, value: sum});
        let user0_balance_start = web3.eth.getBalance(user0).toNumber();

        await smartInvestments.deposit(investorId0, {from: user1, value: sum0});
        let user0_balance = web3.eth.getBalance(user0).toNumber();
        let profit = user0_balance - user0_balance_start;

        assert(profit >= sum0 * (0.03 - 0.005));

        let investor1 = getInvestor(await smartInvestments.getInvestorInfo(investorId1));

        expect(investor1.referrersByLevel[0]).to.equal(investorId0);
    });

    it('withdraw amount', async function () {
        let programsCount = (await smartInvestments.programsCount()).toNumber();
        var programs = [];

        // collect all programs
        for (var i = 0; i < programsCount; i++)
            programs.push(getProgram(await smartInvestments.getProgramInfo(i)));


        for (var i = 0; i < programsCount; i++) {
            let program = programs[i];

            await smartInvestments.deposit(0, {from: accounts[i], value: program.minSum});

            await setNextBlockDelay(hour);
            let amount = (await smartInvestments.withdrawAmount({from: accounts[i]})).toNumber();
            let sum = program.minSum * program.income / 8760;

            expect(amount.toString().substring(0, 7)).to.equal(sum.toString().substring(0, 7));
        }
    });

    it('withdraw all levels', async function () {
        smartInvestments = await SmartInvestments.new({from: accounts[30], value: web3.toWei(100000, 'ether')});

        let programsCount = (await smartInvestments.programsCount()).toNumber();
        var programs = [];

        // collect all programs
        for (var i = 0; i < programsCount; i++)
            programs.push(getProgram(await smartInvestments.getProgramInfo(i)));


        for (var i = 0; i < programsCount; i++) {
            let program = programs[i];

            await smartInvestments.deposit(0, {from: accounts[i], value: program.minSum});
            let user0_balance_start = web3.eth.getBalance(accounts[i]).toNumber();

            await setNextBlockDelay(hour);
            await smartInvestments.withdraw({from: accounts[i]});
            let user0_balance = web3.eth.getBalance(accounts[i]).toNumber();
            let profit = user0_balance - user0_balance_start;
            let sum = program.minSum * program.income / 8760;
        }
    });

});
