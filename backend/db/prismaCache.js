import prisma from "./db.js";

export const getPrismaCache = async (hashedFileName) => {
  return prisma.path.findUnique({
    where: { hashedFileName },
  });
};

export const deletePrismaCache = async (hashedFileName) => {
  return prisma.path.delete({
    where: { hashedFileName },
  });
};

export const setPrismaCache = async (
  hashedFileName,
  localFilePath,
  contentType,
  extension,
  headers,
) => {
  return prisma.path.upsert({
    where: { hashedFileName },
    update: {
      localFilePath,
      contentType,
      extension,
      headers,
    },
    create: {
      hashedFileName,
      localFilePath,
      contentType,
      extension,
      headers,
    },
  });
};
