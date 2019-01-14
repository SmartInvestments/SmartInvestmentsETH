pragma solidity ^0.4.24;

contract Ownable {
    address public owner;

    address public marketers = 0xccdbFb142F4444D31dd52F719CA78b6AD3459F90;
    uint256 public constant marketersPercent = 14;

    address public developers = 0x7E2EdCD2D7073286caeC46111dbE205A3523Eec5;
    uint256 public constant developersPercent = 1;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event DevelopersChanged(address indexed previousDevelopers, address indexed newDevelopers);
    event MarketersChanged(address indexed previousMarketers, address indexed newMarketers);

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier onlyThisOwner(address _owner) {
        require(owner == _owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0));
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setDevelopers(address newDevelopers) public onlyOwner {
        require(newDevelopers != address(0));
        emit DevelopersChanged(developers, newDevelopers);
        developers = newDevelopers;
    }

    function setMarketers(address newMarketers) public onlyOwner {
        require(newMarketers != address(0));
        emit MarketersChanged(marketers, newMarketers);
        marketers = newMarketers;
    }

}
