import prisma from "./db.js";

export const getPrismaCache = async (hashFileName) => {
  return prisma.path.findUnique({
    where: { hashFileName },
  });
};

export const deletePrismaCache = async (hashFileName) => {
  return prisma.path.delete({
    where: { hashFileName },
  });
};

export const setPrismaCache = async (
  hashFileName,
  localFilePath,
  contentType,
  extension,
  headers,
) => {
  return prisma.path.upsert({
    where: { hashFileName },
    update: {
      localFilePath,
      contentType,
      extension,
      headers,
    },
    create: {
      hashFileName,
      localFilePath,
      contentType,
      extension,
      headers,
    },
  });
};
