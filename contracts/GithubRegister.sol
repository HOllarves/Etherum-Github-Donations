pragma solidity ^0.4.18;
import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/**
    This smart contracts allow developers to register their data
    so other people can donate in etherum in a way to thank them
    for their work. (Specially open source devs)
 */
contract GithubRegister is Ownable {

    // Basic struct for saving developers data
    struct Profile {
        string userName;
        string email;
        string repoUrl;
    }

    // Mapping for all the developers that register
    mapping (address => Profile) coders;
    // Simple mapping to search developers by their username
    mapping (string => address) getAddressFromUserName;

    /**
        @dev Adds a new coder to the blockchain
        @param _userName Dev's username
        @param _email Dev's email
        @param _repoUrl Dev's github or bitbucket repository url
     */
    function addCoder(string _userName, string _email, string _repoUrl) public {
        coders[msg.sender].userName = _userName;
        coders[msg.sender].email = _email;
        coders[msg.sender].repoUrl = _repoUrl;
        getAddressFromUserName[_userName] = msg.sender;
    }

    /**
        @dev Gets a specific coder
        @param _userName Developers username to be searched for
     */
    function getCoder(string _userName) public view returns (string userName, string email, string repoUrl) {
        address coderAddress = getCoderAddressByUserName(_userName); 
        return(coders[coderAddress].userName, coders[coderAddress].email, coders[coderAddress].repoUrl);
    }

    /**
        @dev Gets a specific developer's address. This is a private function only meant
        to be used inside the contract's runtime.
        @param _userName Developer's username
     */
    function getCoderAddressByUserName(string _userName) private view returns(address) {
        return getAddressFromUserName[_userName];
    }

    /**
        @dev Transfers funds to registered developer's ethereum account
        @param _userName Developer's username
     */
    function donateToCoder(string _userName) public payable {
        require(msg.value != 0);
        address coderAddress = getCoderAddressByUserName(_userName);
        coderAddress.transfer(msg.value);
    }
}