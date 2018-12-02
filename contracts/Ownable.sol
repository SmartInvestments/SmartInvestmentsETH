pragma solidity ^0.4.24;

contract Ownable {
    address public owner;
    address public developers = 0xB68e8C1EAC20e6B3c92fBB9a601F9Fa1e0475D59;
    address public marketers = 0xB68e8C1EAC20e6B3c92fBB9a601F9Fa1e0475D59;
    uint256 public constant developersPercent = 1;
    uint256 public constant marketersPercent = 14;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event DevelopersChanged(address indexed previousDevelopers, address indexed newDevelopers);
    event MarketersChanged(address indexed previousMarketers, address indexed newMarketers);

    function Ownable() public {
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
