import { Request, Response, NextFunction } from 'express';

const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  console.log('Incoming Request Body:', req.body);

  const { email, phoneNumber } = req.body;

  console.log('Email:', email);
  console.log('Phone Number:', phoneNumber);

  if (!email && !phoneNumber) {
    res.status(400).json({ error: 'Either email or phoneNumber is required.' });
    return;
  }
  
  next();
};

export default validateRequest;
