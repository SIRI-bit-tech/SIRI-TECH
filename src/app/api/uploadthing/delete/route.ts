import { NextRequest, NextResponse } from 'next/server'
import { UTApi } from 'uploadthing/server'
import { auth } from '@/lib/auth'

const utapi = new UTApi()

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { fileKeys } = await request.json()

    if (!fileKeys || !Array.isArray(fileKeys) || fileKeys.length === 0) {
      return NextResponse.json(
        { error: 'File keys are required' },
        { status: 400 }
      )
    }

    // Delete files from UploadThing
    const result = await utapi.deleteFiles(fileKeys)

    return NextResponse.json({
      success: true,
      deletedFiles: fileKeys,
      result
    })

  } catch (error) {
    console.error('Error deleting files:', error)
    return NextResponse.json(
      { error: 'Failed to delete files' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Support POST method as well for compatibility
  return DELETE(request)
}