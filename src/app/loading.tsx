import LoadingSpinner from '@/components/ui/LoadingSpinner'

export default function Loading() {
  return (
    <LoadingSpinner 
      fullScreen 
      size="xl" 
      variant="glass" 
      text="Loading..." 
    />
  )
}