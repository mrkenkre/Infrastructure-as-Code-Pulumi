"use strict";
const pulumi = require("@pulumi/pulumi");
const aws = require("@pulumi/aws");
const awsx = require("@pulumi/awsx");

const config = new pulumi.Config();

const vpcCidr = config.require("vpc-cidr-block");
const vpcName = config.require("vpc-name");
const region = config.require("region");
const igatewayName = config.require("internet-gateway-name");
const igatewayAttachName = config.require("internet-gateway-attachment-name");
const publicRTName = config.require("public-rt-name");
const privateRTName = config.require("private-rt-name");
const igateCidr = config.require("internet-gateway-cidr");
const publicSubPrefix = config.require("publicSubPrefix");
const privateSubPrefix = config.require("privateSubPrefix");
const publicRouteName = config.require("public-route-name");
const publicSubAssociationPrefix = config.require(
  "public-SubAssociationPrefix"
);
const privateSubAssociationPrefix = config.require(
  "private-SubAssociationPrefix"
);
const numOfSubnets = config.require("num_of_subnets");
const webappPort = config.require("web-app-port");

const vpc = new aws.ec2.Vpc(vpcName, {
  cidrBlock: vpcCidr,
  tags: {
    Name: vpcName,
  },
});

const availabilityZones = pulumi.output(
  aws.getAvailabilityZones({ state: "available", region: region })
).names;

const publicSubnets = [];
const privateSubnets = [];

availabilityZones.apply((azs) => {
  const numSubnets = Math.min(azs.length, numOfSubnets);

  // Create 3 public and 3 private subnets in specified availability zones.
  for (let i = 0; i < numSubnets; i++) {
    const publicSubnet = new aws.ec2.Subnet(`${publicSubPrefix}${i}`, {
      vpcId: vpc.id,
      availabilityZone: availabilityZones[i],
      cidrBlock: `10.0.${i * 8}.0/24`,
      mapPublicIpOnLaunch: true,
      tags: {
        Name: `${publicSubPrefix}${i}`,
      },
    });
    publicSubnets.push(publicSubnet);

    const privateSubnet = new aws.ec2.Subnet(`${privateSubPrefix}${i}`, {
      vpcId: vpc.id,
      availabilityZone: availabilityZones[i],
      cidrBlock: `10.0.${i * 8 + 1}.0/24`,
      tags: {
        Name: `${privateSubPrefix}${i}`,
      },
    });
    privateSubnets.push(privateSubnet);

    new aws.ec2.RouteTableAssociation(`${publicSubAssociationPrefix}${i}`, {
      routeTableId: publicRouteTable.id,
      subnetId: publicSubnet.id,
    });

    new aws.ec2.RouteTableAssociation(`${privateSubAssociationPrefix}${i}`, {
      routeTableId: privateRouteTable.id,
      subnetId: privateSubnet.id,
    });
  }
});

//Internet Gateway
const internetGateway = new aws.ec2.InternetGateway(igatewayName, {});

// Attach the Internet Gateway to VPC
const internetGatewayAttachment = new aws.ec2.InternetGatewayAttachment(
  igatewayAttachName,
  {
    vpcId: vpc.id,
    internetGatewayId: internetGateway.id,
  }
);

//public route table
const publicRouteTable = new aws.ec2.RouteTable(publicRTName, {
  vpcId: vpc.id,
  tags: {
    Name: publicRTName,
  },
});

// Create a default route in the public route table that directs traffic to the Internet Gateway
const publicRoute = new aws.ec2.Route(publicRouteName, {
  routeTableId: publicRouteTable.id,
  destinationCidrBlock: igateCidr,
  gatewayId: internetGateway.id,
});

// // Attach all public subnets to the public route table
// publicSubnets.forEach((publicSubnet, index) => {
//   const subnetAssociation = new aws.ec2.RouteTableAssociation(
//     `${publicSubAssociationPrefix}${index}`,
//     {
//       routeTableId: publicRouteTable.id,
//       subnetId: publicSubnet.id,
//     }
//   );
// });

// private route table
const privateRouteTable = new aws.ec2.RouteTable(privateRTName, {
  vpcId: vpc.id,
  tags: {
    Name: privateRTName,
  },
});

// Iterate through private subnets and associate them with the private route table
// for (let i = 0; i < privateSubnets.length; i++) {
//   const subnetAssociation = new aws.ec2.RouteTableAssociation(
//     `${privateSubAssociationPrefix}${i}`,
//     {
//       routeTableId: privateRouteTable.id,
//       subnetId: privateSubnets[i].id,
//     }
//   );
// }

webapp_security_group = aws.ec2.SecurityGroup(
  "application security group",
  (description = "Web Application Security Group"),
  (ingress = [
    aws.ec2.SecurityGroupIngressArgs(
      (protocol = "tcp"),
      (from_port = 22),
      (to_port = 22),
      (cidr_blocks = [igateCidr])
    ),
    aws.ec2.SecurityGroupIngressArgs(
      (protocol = "tcp"),
      (from_port = 80),
      (to_port = 80),
      (cidr_blocks = [igateCidr])
    ),
    aws.ec2.SecurityGroupIngressArgs(
      (protocol = "tcp"),
      (from_port = 443),
      (to_port = 443),
      (cidr_blocks = [igateCidr])
    ),
    aws.ec2.SecurityGroupIngressArgs(
      (protocol = "tcp"),
      (from_port = webappPort),
      (to_port = webappPort),
      (cidr_blocks = [igateCidr])
    ),
  ])
);
