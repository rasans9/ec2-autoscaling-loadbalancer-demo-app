import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface ComputeStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
  sg: ec2.ISecurityGroup;
  psnets: ec2.IPublicSubnet[];
  prnets: ec2.IPrivateSubnet[];
}

export class ComputeStack extends cdk.Stack{
    constructor(scope: Construct, id: string, props: ComputeStackProps) {
        super(scope, id, props);

    const kPair = ec2.KeyPair.fromKeyPairName(this, "KeyPair", "the-keypair-name");

    const ec2Instance = new ec2.Instance(this, "AppServer1", {
        vpc: props.vpc,
        vpcSubnets: { subnets: [props.psnets[0]] },
        instanceType: new ec2.InstanceType("t2.micro"),   
        machineImage: ec2.MachineImage.latestAmazonLinux2023(), 
        securityGroup: props.sg,                                
        keyPair: kPair                           
    });

    cdk.Tags.of(ec2Instance).add("Name", "MyEc2Instance1");

    }
}
