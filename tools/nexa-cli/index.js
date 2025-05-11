#!/usr/bin/env node
const { program } = require('commander');

program
  .name('nexa')
  .description('CLI for interacting with the NEXA blockchain infra')
  .version('0.1.0');

program
  .command('propose')
  .description('Submit a tokenomics proposal')
  .action(() => {
    console.log('Submitting proposal (stub)...');
  });

program
  .command('health')
  .description('Check orchestrator health')
  .action(() => {
    console.log('Orchestrator is healthy');
  });

program.parse();
