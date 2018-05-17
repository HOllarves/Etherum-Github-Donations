import React, { Component } from 'react'
import GithubRegister from '../build/contracts/GithubRegister.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './alert.css'
import './App.css'


class App extends Component {
  constructor(props) {

    super(props)
    const contract = require('truffle-contract');

    this.state = {
      storageValue: 0,
      web3: null,
      userSearch: "",
      githubRegisterContract: contract(GithubRegister),
      contractInstance: {},
      username: "",
      email: "",
      repoUrl: "",
      account: "",
      currentCoder: {},
      alert: false
    }

    this.getCoder = this.getCoder.bind(this);
    this.updateSearch = this.updateSearch.bind(this);
    this.handleRegisterForm = this.handleRegisterForm.bind(this);
    this.addCoder = this.addCoder.bind(this);
    this.setDonation = this.setDonation.bind(this);
    this.makeDonation = this.makeDonation.bind(this);

  }

  componentWillMount() {

    // Get network provider and web3 instance.
    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3,
          alert: false
        });
        // Instantiate contract once web3 provided.
        this.instantiateContract();
      })
      .catch(() => {
        this.setState({ alert: "Error finding web3." })
      })
  }

  /**
   * Updates search string
   * @param {*} event 
   */
  updateSearch(event) {
    this.setState({ userSearch: event.target.value });
  }

  /**
   * Calls the smartcontract to get a specific
   * developer
   * @param {*} event 
   */
  getCoder(event) {
    event.preventDefault();
    this.state.contractInstance.getCoder(this.state.userSearch)
      .then((result) => {
        if (result[0] !== "") {
          this.currentCoder = this.extractCoder(result)
          this.setState({ currentCoder: this.currentCoder, alert: false })
        } else {
          this.setState({ alert: "Developer not found" })
        }
      }).catch((err) => {
        this.setState({ alert: "Developer not found" })
      })
  }

  /**
   * Transforms data recieved from the smart contract
   * to a simple javascript object
   * @param {*} data 
   */
  extractCoder(data) {
    return {
      name: data[0] ? data[0] : null,
      email: data[1] ? data[1] : null,
      repo: data[2] ? data[2] : null
    }
  }

  /**
   * Handles submission of 
   * register form. Github's OAuth should be implemented
   * to avoid fraudulent registers. Due to time restrains I won't
   * be compeleting such feature.
   * @param {*} event 
   */
  handleRegisterForm(event) {
    const value = event.target.value;
    const name = event.target.name;
    this.setState({
      [name]: value
    });
  }

  /**
   * Adds a new developer to the
   * blockchain
   * @param {*} event 
   */
  addCoder(event) {
    event.preventDefault();
    this.state.contractInstance.addCoder(this.state.username, this.state.email, this.state.repoUrl, { from: this.state.account })
      .then((result) => {
        this.setState({ alert: false })
      }).catch((err) => {
        this.setState({ alert: "Unable to add developer. Check logs!" });
        console.log(err)
      })
  }

  /**
   * Instantiates contract in the browser
   * and saves its instance in the state variable
   */
  instantiateContract() {
    this.state.githubRegisterContract.setProvider(this.state.web3.currentProvider);
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.state.githubRegisterContract.deployed().then((instance) => {
        this.setState({
          contractInstance: instance,
          account: accounts[0],
          alert: false
        });
      })
    })
  }

  /**
   * Performs a donation to a specific
   * developer.
   */
  makeDonation() {
    console.log("Making donation")
    this.state.contractInstance.donateToCoder(this.state.username, { from: this.state.account, value: this.state.currentCoder.donation })
      .then((result) => {
        this.setState({ alert: false })
      }).catch((err) => {
        this.setState({ alert: "Unable to make donation. Check logs!" });
        console.log(err)
      })
  }

  /**
   * Updates inteded donation so it's correctly sent
   * when submitted.
   * @param {*} event 
   */
  setDonation(event) {
    this.currentCoder.donation = event.target.value * 1000000000000000000;
    this.setState({ currentCoder: this.currentCoder });
  }

  render() {
    return (
      <div className="App">

        {
          this.state.alert ?
            <div id="alert">
              <a className="alert">{this.state.alert}</a>
            </div> : null
        }

        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">Donate to code</a>
        </nav>
        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1> Make a donation to your favorite coders with Ethereum!</h1>
            </div>
            <div className="pure-u-1-1">
              <form
                className="pure-form"
                onSubmit={(e) => { this.getCoder(e); }}>
                <fieldset>
                  <input
                    type="text"
                    placeholder="Username"
                    className="pure-input-1-2"
                    onChange={(e) => { this.updateSearch(e); }} />
                  <button type="submit" className="pure-button pure-button-primary">Search</button>
                </fieldset>
              </form>
            </div>
            {this.currentCoder &&
              <div className="pure-u-1-1 coder-container">
                <h1> Name: {this.state.currentCoder.name} </h1>
                <h1> Email: {this.state.currentCoder.email} </h1>
                <h1> Repo: <a href={this.state.currentCoder.repo} target="_blank">{this.state.currentCoder.repo}</a> </h1>

                <label> Donation (in ether): </label>
                <input
                  className="pure-input-1-2"
                  onChange={this.setDonation}
                  type="number" />
                <button
                  className="pure-button pure-button-primary"
                  onClick={this.makeDonation}> Donate </button>
              </div>
            }
          </div>
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1> Or, if you're a coder... Add yourself to recieve donations!</h1>
            </div>
            <div className="pure-u-1-2">
              <form
                className="pure-form pure-form-stacked"
                onSubmit={(e) => { this.addCoder(e); }}>
                <fieldset>
                  <legend>Please fill out some basic information: </legend>
                  <label>Username: </label>
                  <input
                    name="username"
                    id="user_name"
                    type="text"
                    placeholder="Username"
                    onChange={this.handleRegisterForm}
                    className="pure-input-1" />

                  <label>Email: </label>
                  <input
                    name="email"
                    id="email"
                    type="email"
                    placeholder="Email"
                    onChange={this.handleRegisterForm}
                    className="pure-input-1" />

                  <label>Repo URL: </label>
                  <input
                    name="repoUrl"
                    id="repo_url"
                    type="text"
                    placeholder="https://github.com/SomeUserName"
                    onChange={this.handleRegisterForm}
                    className="pure-input-1" />
                  <button type="submit" className="pure-button pure-button-primary ">Submit</button>
                </fieldset>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
