import { Request, Response } from 'express';
import prisma from '../prisma/client';

interface ContactData {
  phoneNumber?: string;
  email?: string;
}

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber, email }: ContactData = req.body;

    // Fetch contacts matching either phoneNumber or email
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [{ phoneNumber: phoneNumber || undefined }, { email: email || undefined }],
      },
    });

    let primaryContact: { id: number; phoneNumber: string | null; email: string | null; linkedId: number | null; linkPrecedence: string; createdAt: Date; updatedAt: Date; deletedAt: Date | null; };
    let secondaryContacts: any[] = [];

    if (existingContacts.length === 0) {
      primaryContact = await prisma.contact.create({
        data: { phoneNumber, email, linkPrecedence: 'primary' },
      });
    } else {
      // **Find primary contacts**
      const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');

      primaryContact = primaryContacts.length === 1
        ? primaryContacts[0]
        : primaryContacts.reduce((earlier, current) =>
            earlier.createdAt < current.createdAt ? earlier : current
          );

      // Convert extra primary contacts to secondary
      await prisma.contact.updateMany({
        where: { id: { in: primaryContacts.map(c => c.id).filter(id => id !== primaryContact.id) } },
        data: { linkedId: primaryContact.id, linkPrecedence: 'secondary' },
      });

      // **Create new secondary contact if not already present**
      const isNewSecondary = !existingContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
      if (isNewSecondary) {
        await prisma.contact.create({
          data: { phoneNumber, email, linkedId: primaryContact.id, linkPrecedence: 'secondary' },
        });
      }

      // Fetch updated secondary contacts
      secondaryContacts = await prisma.contact.findMany({ where: { linkedId: primaryContact.id } });
    }

    // Construct response
    const emails = Array.from(new Set([primaryContact.email, ...secondaryContacts.map(c => c.email)].filter(Boolean)));
    const phoneNumbers = Array.from(new Set([primaryContact.phoneNumber, ...secondaryContacts.map(c => c.phoneNumber)].filter(Boolean)));
    const secondaryContactIds = secondaryContacts.map(c => c.id);

    res.json({
      success: true,
      message: 'Contact identified successfully.',
      data: {
        contact: {
          primaryContactId: primaryContact.id,
          emails,
          phoneNumbers,
          secondaryContactIds,
        },
      },
    });
  } catch (error) {
    console.error('Error in identifyContact:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error', error: error });
  }
};
