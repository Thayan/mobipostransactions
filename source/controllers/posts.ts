import { Request, Response, NextFunction } from 'express';
import axios, { AxiosResponse } from 'axios';

const API_LOCATION: string = "https://cloud.mobi-pos.com/api_access/api_resource";
const TOKEN: string = "1e4ead0e0b2bd36a4f595fa4d7f6adcdf987cacb";
const OUTLET = "outlet1";

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

interface Transaction {
    idTransaction: string;
    ReceiptNo: string;
    ReceiptTotalAmount: string;
    TableID: string;
}

const schedule = require('node-schedule');

const job = schedule.scheduleJob('55 23 * * *', function() { //scheduled for 23:45:00, every day
    console.log('The answer to life, the universe, and everything!');
    // sendOTP();
    process.stdout.write('called schedule');
});

const testjob = schedule.scheduleJob('57 21 * * *', async function() { //test schedule
    process.stdout.write("Sent SMS");
    sendOTP("+4407449529440", buildMessage(await getTotalRevenueToday()), "Jaffna House");
});

const format = (input: number, padLength: number): string => {
    return input.toString().padStart(padLength, '0');
};

function buildMessage(totalRevenue:string):string{
    let message:string = "";
    const date = new Date();
    message = "Jaffna House - " + getDateMessageFormat(date) + "\n";
    message = message + "Total: £" + totalRevenue;
    return message;
}

function getDateTimeNight(date: Date): string {
    const dateTimeNight =
        format(date.getFullYear(), 4) +
        '-' +
        format(date.getMonth() + 1, 2) +
        '-' +
        format(date.getDate(), 2) +
        ' ' +
        format(23, 2) +
        ':' +
        format(59, 2) +
        ':' +
        format(1, 2);

    return dateTimeNight;
}

function getDateTimeMorning(date: Date): string {
    const dateTimeMorning =
        format(date.getFullYear(), 4) +
        '-' +
        format(date.getMonth() + 1, 2) +
        '-' +
        format(date.getDate(), 2) +
        ' ' +
        format(2, 2) +
        ':' +
        format(0, 2) +
        ':' +
        format(0, 2);

    return dateTimeMorning;
}

function getDateMessageFormat(date:Date):string {
    const dateTimeMorning =
        format(date.getFullYear(), 4) +
        '-' +
        format(date.getMonth() + 1, 2) +
        '-' +
        format(date.getDate(), 2);

    return dateTimeMorning;
}

async function getTotalRevenueToday(): Promise < string > {
    const date = new Date();
    let result: AxiosResponse = await axios.post(API_LOCATION, new URLSearchParams({
        api_token: TOKEN,
        resource_type: 'Transaction',
        start_date: getDateTimeMorning(date),
        end_date: getDateTimeNight(date),
        outlet: OUTLET
    }));
    let posts: [Post] = result.data;
    let transactions: [Transaction] = result.data.result.user_data;
    return calculateTransactionsTotal(transactions);
}

function calculateTransactionsTotal(transactions: Transaction[]): string {
    let daysRevenue: number = 0;
    transactions.forEach(transaction => {
        daysRevenue = daysRevenue + parseInt(transaction.ReceiptTotalAmount);
    });
    return daysRevenue.toString();
}

const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    const date = new Date();
    let result: AxiosResponse = await axios.post(API_LOCATION, new URLSearchParams({
        api_token: TOKEN,
        resource_type: 'Transaction',
        start_date: getDateTimeMorning(date),
        end_date: getDateTimeNight(date),
        outlet: OUTLET
    }));
    let posts: [Post] = result.data;
    let transactions: [Transaction] = result.data.result.user_data;
    calculateTransactionsTotal(transactions);
    return res.status(200).json({ message: posts });
}

//app.js
const express = require('express');
const app = express();
const AWS = require('aws-sdk'); //npm install aws-sdk
require('dotenv').config(); //npm install dotenv
const PORT = '3000';

//function to send OTP using AWS-SNS
function sendOTP(mobileNo:string, message:string, subject:string) {
    var params = {
        Message: message,
        /* required */
        PhoneNumber: mobileNo,
        Subject: subject,
    };
    return new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise()
        .then(() => {
            process.stdout.write(('SUCCESS - Sent to ' + mobileNo));
        })
        .catch((err: string) => {
            process.stdout.write(('Error ' + err));
            return err;
        });
}

export default { getTransactions };