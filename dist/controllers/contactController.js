"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyContact = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const identifyContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { phoneNumber, email } = req.body;
        // Fetch contacts matching either phoneNumber or email
        const existingContacts = yield client_1.default.contact.findMany({
            where: {
                OR: [{ phoneNumber: phoneNumber || undefined }, { email: email || undefined }],
            },
        });
        let primaryContact;
        let secondaryContacts = [];
        if (existingContacts.length === 0) {
            primaryContact = yield client_1.default.contact.create({
                data: { phoneNumber, email, linkPrecedence: 'primary' },
            });
        }
        else {
            // **Find primary contacts**
            const primaryContacts = existingContacts.filter(c => c.linkPrecedence === 'primary');
            primaryContact = primaryContacts.length === 1
                ? primaryContacts[0]
                : primaryContacts.reduce((earlier, current) => earlier.createdAt < current.createdAt ? earlier : current);
            // Convert extra primary contacts to secondary
            yield client_1.default.contact.updateMany({
                where: { id: { in: primaryContacts.map(c => c.id).filter(id => id !== primaryContact.id) } },
                data: { linkedId: primaryContact.id, linkPrecedence: 'secondary' },
            });
            // **Create new secondary contact if not already present**
            const isNewSecondary = !existingContacts.some(c => c.email === email && c.phoneNumber === phoneNumber);
            if (isNewSecondary) {
                yield client_1.default.contact.create({
                    data: { phoneNumber, email, linkedId: primaryContact.id, linkPrecedence: 'secondary' },
                });
            }
            // Fetch updated secondary contacts
            secondaryContacts = yield client_1.default.contact.findMany({ where: { linkedId: primaryContact.id } });
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
    }
    catch (error) {
        console.error('Error in identifyContact:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error', error: error });
    }
});
exports.identifyContact = identifyContact;
