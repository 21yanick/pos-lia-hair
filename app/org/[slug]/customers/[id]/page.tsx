import { CustomerDetailPage } from '@/modules/customers'

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  return <CustomerDetailPage customerId={id} />
}