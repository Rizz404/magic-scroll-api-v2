import { faker } from "@faker-js/faker";
import prisma from "../config/dbConfig";

async function createRandomUser() {
  return await prisma.user
    .create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: "177013",
        isOauth: false,
      },
    })
    .then(() => console.log("Success"))
    .catch((error) => console.error(error));
}

(async () => {
  const userCreationPromises = [];

  for (let i = 0; i < 10; i++) {
    userCreationPromises.push(createRandomUser());
  }

  try {
    await Promise.all(userCreationPromises);
    console.log("All users created successfully!");
  } catch (error) {
    console.error("Error creating users:", error);
  } finally {
    console.log("Exiting process...");
    process.exit(0); // Exit with success code
  }
})();
