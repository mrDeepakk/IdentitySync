import prisma from "../prisma/client";

interface ContactData {
  phoneNumber?: string;
  email?: string;
}

const getContacts = async () => {
  return await prisma.contact.findMany();
};


const createContact = async (data: ContactData) => {
  return await prisma.contact.create({ data });
};

const identifyContact = async (data: ContactData) => {
  const { phoneNumber, email } = data;

  const existingContacts = await prisma.contact.findMany({
    where: {
      OR: [{ phoneNumber: phoneNumber || undefined }, { email: email || undefined }],
    },
  });

  

  let primaryContact: { id: number; phoneNumber: string | null; email: string | null; linkedId: number | null; linkPrecedence: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null; };
  let secondaryContacts: any[] = [];

  if (existingContacts.length === 0) {
    primaryContact = await prisma.contact.create({
      data: { phoneNumber, email, linkPrecedence: "primary" },
    });
  } else {
    const primaryContacts = existingContacts.filter(c => c.linkPrecedence === "primary");

    if (primaryContacts.length === 1) {
      primaryContact = primaryContacts[0];
    } else {
      primaryContact = primaryContacts.reduce((earlier, current) =>
        earlier.createdAt < current.createdAt ? earlier : current
      );

      await prisma.contact.updateMany({
        where: { id: { in: primaryContacts.map(c => c.id).filter(id => id !== primaryContact.id) } },
        data: { linkedId: primaryContact.id, linkPrecedence: "secondary" },
      });
    }

    const isNewSecondary = !existingContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
    if (isNewSecondary) {
      await prisma.contact.create({
        data: {
          phoneNumber,
          email,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        },
      });
    }

    secondaryContacts = await prisma.contact.findMany({ where: { linkedId: primaryContact.id } });
  }

  const emails = Array.from(new Set([primaryContact.email, ...secondaryContacts.map(c => c.email)].filter(Boolean)));
  const phoneNumbers = Array.from(new Set([primaryContact.phoneNumber, ...secondaryContacts.map(c => c.phoneNumber)].filter(Boolean)));
  const secondaryContactIds = secondaryContacts.map(c => c.id);

  return {
    contact: {
      primaryContatctId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
};

export default { getContacts, createContact, identifyContact };
