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

const sampleQuestion = {
    "_id": new ObjectId(),
}

const titles = [
    "What is your favorite weekend activity?",
    "Which hobby do you enjoy the most?",
    "What would you prefer to do on a vacation?",
    "Which pastime do you find most relaxing?"
];

const activities = [
    "Reading a good book",
    "Going for a hike",
    "Watching a movie",
    "Playing video games",
    "Cooking a new recipe",
    "Practicing a musical instrument",
    "Gardening",
    "Exercising at the gym",
    "Learning something new",
    "Visiting a museum"
];

function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Generate random title and answers
sampleQuestion.title = getRandomElement(titles);

// Shuffle activities and pick the first four for the answers
const shuffledActivities = activities.sort(() => 0.5 - Math.random());
[sampleQuestion.firstAnswer, sampleQuestion.secondAnswer, sampleQuestion.thirdAnswer, sampleQuestion.fourthAnswer] = shuffledActivities.slice(0, 4);

describe('Get all Questions', () => {
    const accessToken = jwt.sign({ _id: sampleUser._id }, process.env.AUTH_TOKEN_SECRET, { expiresIn: '1d' });
    before(async () => {
        const collectionUser = await getMongodbCollection('users');
        await collectionUser.insertOne(sampleUser);
        const collectionQuestion = await getMongodbCollection('questions');
        await collectionQuestion.insertOne(sampleQuestion);
    });

    it('should return the document when all validation passes', async () => {
        const response = await request.get(`http://localhost:3006/api/questions`, {
            json: true,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            },
        });

        // Check if the response object has the expected structure with questions as an array
        expect(response).to.be.an('object').that.includes.keys('totalCount', 'questions', 'filteredCount');
        expect(response.questions).to.be.an('array');
        // Here you should conditionally run the following based on  whether you expect the array to be empty or not:
        // If you expect at least one question in the response (including sampleQuestion):
        expect(response.questions.length).to.be.greaterThan(0);

        // Then check if sampleQuestion exists in the users array
        const exists = response.questions.some(question => new ObjectId(question._id).equals(new ObjectId(sampleQuestion._id)));
        expect(exists).to.be.true;
    });

    after(async () => {
        const collectionUser = await getMongodbCollection('users');
        await collectionUser.deleteOne({ _id: sampleUser._id });
        const collectionQuestion = await getMongodbCollection('questions');
        await collectionQuestion.deleteOne({ _id: sampleQuestion._id });
    });
});