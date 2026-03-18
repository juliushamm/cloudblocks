import { EC2Client, DescribeInternetGatewaysCommand } from '@aws-sdk/client-ec2'
import type { CloudNode } from '../../../renderer/types/cloud'

export async function listInternetGateways(client: EC2Client, region: string): Promise<CloudNode[]> {
  try {
    const res = await client.send(new DescribeInternetGatewaysCommand({}))
    return (res.InternetGateways ?? []).map((item): CloudNode => {
      const id = item.InternetGatewayId ?? ''
      const label = item.Tags?.find(t => t.Key === 'Name')?.Value ?? id
      return {
        id,
        type:     'igw',
        label,
        status:   item.Attachments?.[0]?.State === 'available' ? 'running' : 'unknown',
        region,
        metadata: { state: item.Attachments?.[0]?.State ?? '' },
        parentId: item.Attachments?.[0]?.VpcId,
      }
    })
  } catch {
    return []
  }
}
