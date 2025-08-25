import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class NetworkStack extends cdk.Stack{

    public readonly vpc: ec2.Vpc;
    public readonly sg: ec2.SecurityGroup;
    public readonly psnets: ec2.IPublicSubnet[];
    public readonly prnets: ec2.IPrivateSubnet[];

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.psnets = [];
        this.prnets = [];

        this.vpc = new ec2.Vpc(this, "MyVpc", {
            ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
            maxAzs: 2,
            natGateways: 0,
            subnetConfiguration:[]     
        });

        cdk.Tags.of(this.vpc).add("Name", "eal-test-vpc");

        const igw = new ec2.CfnInternetGateway(this, "MyInternetGateway");

        cdk.Tags.of(igw).add("Name", "eal-test-igw");

        new ec2.CfnVPCGatewayAttachment(this, "VpcIgwAttachment", {
        vpcId: this.vpc.vpcId,
        internetGatewayId: igw.ref,
        });

        const publicSubnet1 = new ec2.Subnet(this, "PublicSubnet1", {
            vpcId: this.vpc.vpcId,
            cidrBlock: "10.0.1.0/24",
            availabilityZone: this.availabilityZones[0],
            mapPublicIpOnLaunch: true
        });
        
        this.psnets.push(publicSubnet1);
 
        cdk.Tags.of(publicSubnet1).add("Name", "eal-test-public-subnet-1");

        const publicSubnet2 = new ec2.Subnet(this, "PublicSubnet2", {
            vpcId: this.vpc.vpcId,
            cidrBlock: "10.0.2.0/24",
            availabilityZone: this.availabilityZones[1],
            mapPublicIpOnLaunch: true
        });

        this.psnets.push(publicSubnet2);

        cdk.Tags.of(publicSubnet2).add("Name", "eal-test-public-subnet-2");

        const purt = new ec2.CfnRouteTable(this, "PublicRouteTable", {
            vpcId: this.vpc.vpcId,
        });

        cdk.Tags.of(publicSubnet1).add("Name", "eal-test-public-route-table");

        new ec2.CfnRoute(this, "DefaultRoute", {
        routeTableId: purt.ref,
        destinationCidrBlock: "0.0.0.0/0",
        gatewayId: igw.ref,
        });

        new ec2.CfnSubnetRouteTableAssociation(this, "public-subnet1-association", {
        subnetId: publicSubnet1.subnetId,
        routeTableId: purt.ref,
        });

        new ec2.CfnSubnetRouteTableAssociation(this, "public-subnet2-association", {
        subnetId: publicSubnet2.subnetId,
        routeTableId: purt.ref,
        });


        this.sg = new ec2.SecurityGroup(this, "EC2SInstance1SG", {
            vpc: this.vpc,
            allowAllOutbound: true,
            description: "Allow SSH and HTTP access",
        });
        
        this.sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), "SSH Access");
        this.sg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "HTTP Access");

        cdk.Tags.of(this.sg).add("Name", "eal-test-sg-1");
    }
}