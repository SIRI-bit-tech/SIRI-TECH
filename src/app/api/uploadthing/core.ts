import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { UTApi } from "uploadthing/server";

const f = createUploadthing();
const utapi = new UTApi();

// Auth function using better-auth
const getUser = async (req: Request) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user || session.user.role !== 'ADMIN') {
      return null;
    }

    return { id: session.user.id };
  } catch (error) {
    return null;
  }
};

// File deletion utility
export const deleteFile = async (fileKey: string) => {
  try {
    await utapi.deleteFiles([fileKey]);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: 'Failed to delete file' };
  }
};

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Project images with optimized settings
  imageUploader: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 10,
      minFileCount: 1
    }
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id, uploadType: "project-images" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Project images upload complete for userId:", metadata.userId);
      console.log("file url", file.url, "file key", file.key);

      // Return file info for client
      return {
        uploadedBy: metadata.userId,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        uploadType: metadata.uploadType
      };
    }),

  // Profile image with strict size limits
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
      minFileCount: 1
    }
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id, uploadType: "profile-image" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile image upload complete for userId:", metadata.userId);
      console.log("file url", file.url, "file key", file.key);

      return {
        uploadedBy: metadata.userId,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        uploadType: metadata.uploadType
      };
    }),

  // Resume PDF with validation
  resumePdf: f({
    pdf: {
      maxFileSize: "8MB",
      maxFileCount: 1,
      minFileCount: 1
    }
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id, uploadType: "resume-pdf" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Resume upload complete for userId:", metadata.userId);
      console.log("file url", file.url, "file key", file.key);

      return {
        uploadedBy: metadata.userId,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        uploadType: metadata.uploadType
      };
    }),

  // General file uploader for various file types
  fileUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
    pdf: { maxFileSize: "8MB", maxFileCount: 3 },
    text: { maxFileSize: "1MB", maxFileCount: 5 }
  })
    .middleware(async ({ req }) => {
      const user = await getUser(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id, uploadType: "general-files" };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("File upload complete for userId:", metadata.userId);
      console.log("file url", file.url, "file key", file.key);

      return {
        uploadedBy: metadata.userId,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
        uploadType: metadata.uploadType
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;