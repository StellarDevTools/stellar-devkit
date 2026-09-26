#!/usr/bin/env node

/**
 * Stellar DevKit CLI
 *
 * Developer toolbox for Stellar and Soroban development
 */

import { Command } from 'commander';
import { createXDRCommand, createRPCCommand, createAccountCommand, createExplainCommand } from '../src/commands';

const program = new Command();

program
  .name('stellar-dev')
  .description('Developer toolbox for building, inspecting, and debugging Stellar/Soroban applications')
  .version('0.1.0');

// Add commands
program.addCommand(createXDRCommand());
program.addCommand(createRPCCommand());
program.addCommand(createAccountCommand());
program.addCommand(createExplainCommand());

// Parse arguments
program.parse();
