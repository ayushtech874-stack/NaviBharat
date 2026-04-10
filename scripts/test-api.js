const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'testuser123@example.com';
    const password = 'securepassword';
    const name = 'Test User';

    console.log("Checking if user exists...");
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log("User already exists, deleting...");
      await prisma.user.delete({ where: { email } });
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Creating user...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("Signing JWT...");
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'super-secret-key', { expiresIn: '7d' });

    console.log("User created successfully!");
    console.log(user);
    console.log(token);
    
    console.log("Testing Login...");
    const loginUser = await prisma.user.findUnique({ where: { email } });
    const isValid = await bcrypt.compare(password, loginUser.password);
    if (isValid) {
      console.log("Login successful!");
    } else {
      console.log("Login credentials invalid");
    }

  } catch (err) {
    console.error("Test failed:");
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
