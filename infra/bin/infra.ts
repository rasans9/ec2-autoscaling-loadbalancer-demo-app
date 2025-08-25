#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { NetworkStack } from '../lib/network-stack';
import { ComputeStack } from '../lib/ComputeStack';

const app = new cdk.App();

const network = new NetworkStack(app, "NetworkStack");

new ComputeStack(app, "ComputeStack", { vpc: network.vpc,sg:network.sg,psnets:network.psnets,prnets:network.prnets});


