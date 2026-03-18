// src/main/aws/provider.ts
import type { CloudNode } from '../../renderer/types/cloud'
import type { AwsClients } from './client'
import { describeInstances, describeVpcs, describeSubnets, describeSecurityGroups } from './services/ec2'
import { describeDBInstances } from './services/rds'
import { listBuckets } from './services/s3'
import { listFunctions } from './services/lambda'
import { describeLoadBalancers } from './services/alb'
import { listCertificates } from './services/acm'
import { listDistributions } from './services/cloudfront'
import { listApis } from './services/apigw'

/**
 * Contract every cloud provider plugin must satisfy.
 * M6 will add AzureProvider, GcpProvider implementing this.
 */
export interface CloudProvider {
  readonly id: string
  scan(clients: AwsClients, region: string): Promise<CloudNode[]>
}

export const awsProvider: CloudProvider = {
  id: 'aws',
  async scan(clients, region) {
    const results = await Promise.all([
      describeInstances(clients.ec2, region),
      describeVpcs(clients.ec2, region),
      describeSubnets(clients.ec2, region),
      describeSecurityGroups(clients.ec2, region),
      describeDBInstances(clients.rds, region),
      listBuckets(clients.s3, region),
      listFunctions(clients.lambda, region),
      describeLoadBalancers(clients.alb, region),
      listCertificates(clients.acm),
      listDistributions(clients.cloudfront),
      listApis(clients.apigw, region),
    ])
    return results.flat()
  },
}
