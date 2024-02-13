// scripts/deploy.ts
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account:', deployer.address);

  const SaveEther = await ethers.getContractFactory('SaveEther');
  const saveEther = await SaveEther.deploy();
  
  await saveEther.waitForDeployment();

  console.log('SaveEther deployed to:', saveEther.target);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });

