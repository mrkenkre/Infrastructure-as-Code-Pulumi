# Infrastructure as Code with Pulumi

## Overview
This repository contains scripts for setting up cloud infrastructure using Pulumi, automating the creation of various AWS and GCP resources.

## Prerequisites
- Node.js
- Pulumi
- AWS CLI
- GCP CLI

## AWS Resources
- VPC, Subnets, Internet Gateway, Route Tables
- EC2 Instances
- RDS Database
- SNS Topics
- CloudWatch Roles and Alarms
- Lambda Functions
- Auto Scaling Groups

## GCP Resources
- Storage Buckets
- Service Accounts

## Configuration
Configure required variables in `.yaml files` (VPC CIDR blocks, instance types, database configurations, etc.)

## Certificate import command:
aws iam upload-server-certificate --server-certificate-name demo_ssl_certificate --certificate-body file://cert_files/demo_mayurkenkre.me/demo_mayurkenkre_me.crt --private-key file://cert_files/csr_openssl.key --certificate-chain file://cert_files/demo_mayurkenkre.me/demo_mayurkenkre_me.ca-bundle

## Deployment
Run `pulumi up` to deploy the infrastructure.
