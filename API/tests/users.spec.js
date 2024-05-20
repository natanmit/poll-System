'use strict';

const expect = require('chai').expect;
const request = require('request-promise');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const { getMongodbCollection } = require('../config/dbConfig');

function generateRandomName() {
    const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Hannah', 'Ivan', 'Julia', 'Kyle', 'Laura'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Williams', 'Jones', 'Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'];

    return {
        firstname: firstNames[Math.floor(Math.random() * firstNames.length)],
        lastname: lastNames[Math.floor(Math.random() * lastNames.length)]
    };
}

function generateRandomEmail(firstName, lastName) {
    const domains = ['example.com', 'mail.com', 'test.org', 'gmail.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}
const { firstname, lastname } = generateRandomName();

let sampleUser = {
    "_id": new ObjectId(),
    "password": "$2b$10$HBU32JOg0AmSurTSMAlsauxN.48lLdtR/BdLPRfckyskJNEmnpKTK",
    "birthday": "1990-01-01",
    "address": "123 Main Street, Anytown, USA"
}

sampleUser.firstname = firstname;
sampleUser.lastname = lastname;
sampleUser.email = generateRandomEmail(firstname, lastname);

describe('Get all Users', () => {
    const accessToken = jwt.sign({ _id: sampleUser._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '1d' });
    before(async () => {
        const collection = await getMongodbCollection('users');
        await collection.insertOne(sampleUser);
    });

    it('should return the document when all validation passes', async () => {
        const response = await request.get(`http://localhost:3006/api/users`, {
            json: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
        });

        // Check if the response object has the expected structure with users as an array
        expect(response).to.be.an('object').that.includes.keys('totalCount', 'users', 'filteredCount');
        expect(response.users).to.be.an('array');
        // Here you should conditionally run the following based on  whether you expect the array to be empty or not:
        // If you expect at least one user in the response (including sampleUser):
        expect(response.users.length).to.be.greaterThan(0);

        // Then check if sampleUser exists in the users array
        const exists = response.users.some(user => new ObjectId(user._id).equals(new ObjectId(sampleUser._id)));
        expect(exists).to.be.true;

        // Add a check to ensure there are no duplicate emails
        const emails = response.users.map(user => user.email);
        const uniqueEmails = new Set(emails);
        expect(uniqueEmails.size).to.equal(emails.length);
    });

    after(async () => {
        const collection = await getMongodbCollection('users');
        await collection.deleteOne({ _id: sampleUser._id });

    });
});