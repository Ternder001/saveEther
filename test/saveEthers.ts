import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { expect } from "chai";

describe("SaveEther", function () {


  async function deployTodoList() {
    
    const SaveEther = await ethers.getContractFactory("SaveEther");
    const saveEther = await SaveEther.deploy();
    await saveEther.waitForDeployment();

    return { saveEther };
  }

  it("Should deposit Ether successfully", async function () {
    const { saveEther } = await loadFixture(deployTodoList);
    const initialBalance = await ethers.provider.getBalance(saveEther.target);
    const toWei = (num) => ethers.utils.parseEther(num.toString())
    const depositAmount = ethers.utils.parseEther("1");

    await saveEther.deposit({ value: depositAmount });

    const finalBalance = await ethers.provider.getBalance(saveEther.target);
    expect(finalBalance).to.equal(initialBalance.add(depositAmount));
  });

  it("Should withdraw Ether successfully", async function () {
    const { saveEther } = await loadFixture(deployTodoList);
    const depositAmount = ethers.utils.parseEther("1");
    await saveEther.deposit({ value: depositAmount });

    const initialBalance = await ethers.provider.getBalance(saveEther.target);
    const withdrawTx = await saveEther.withdraw();
    const receipt = await withdrawTx.wait();
    const gasUsed = receipt.gasUsed.mul(await ethers.provider.getGasPrice());
    const finalBalance = await ethers.provider.getBalance(saveEther.target);

    expect(finalBalance).to.equal(initialBalance.sub(gasUsed).sub(depositAmount));
  });

  it("Should send out savings to another address", async function () {
    const { saveEther } = await loadFixture(deployTodoList);
    const depositAmount = ethers.utils.parseEther("1");
    await saveEther.deposit({ value: depositAmount });

    const receiver = ethers.Wallet.createRandom().address;
    const initialReceiverBalance = await ethers.provider.getBalance(receiver);

    await saveEther.sendOutSaving(receiver, depositAmount);

    const finalReceiverBalance = await ethers.provider.getBalance(receiver);
    expect(finalReceiverBalance).to.equal(initialReceiverBalance.add(depositAmount));
  });

  it("Should check contract balance", async function () {
    const { saveEther } = await loadFixture(deployTodoList);
    const contractBalance = await saveEther.checkContractBal();
    expect(contractBalance).to.equal(0);

    const depositAmount = ethers.utils.parseEther("1");
    await saveEther.deposit({ value: depositAmount });

    const updatedContractBalance = await saveEther.checkContractBal();
    expect(updatedContractBalance).to.equal(depositAmount);
  });

  it("Should check savings of a user", async function () {
    const { saveEther } = await loadFixture(deployTodoList);
    const user = ethers.Wallet.createRandom().address;
    const userSavings = await saveEther.checkSavings(user);
    expect(userSavings).to.equal(0);

    const depositAmount = ethers.utils.parseEther("1");
    await saveEther.connect(ethers.provider.getSigner(user)).deposit({ value: depositAmount });

    const updatedUserSavings = await saveEther.checkSavings(user);
    expect(updatedUserSavings).to.equal(depositAmount);
  });

});
