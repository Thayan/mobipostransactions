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
const axios_1 = __importDefault(require("axios"));
const API_LOCATION = "https://cloud.mobi-pos.com/api_access/api_resource";
const TOKEN = "1e4ead0e0b2bd36a4f595fa4d7f6adcdf987cacb";
const OUTLET = "outlet1";
const schedule = require('node-schedule');
const job = schedule.scheduleJob('38 21 * * *', function () {
    return __awaiter(this, void 0, void 0, function* () {
        process.stdout.write("Sent SMS");
        sendOTP("+447500756347", buildMessage(yield getTotalRevenueToday()), "Jaffna House");
    });
});
// const testjob = schedule.scheduleJob('52 23 * * *', async function() { //test schedule
//     process.stdout.write("Sent SMS");
//     sendOTP("+4407449529440", buildMessage(await getTotalRevenueToday()), "Jaffna House");
// });
// async function callJob(){
//     process.stdout.write("Sent SMS - call job");
//     sendOTP("+4407449529440", buildMessage(await getTotalRevenueToday()), "Jaffna House");
// }
const format = (input, padLength) => {
    return input.toString().padStart(padLength, '0');
};
function buildMessage(totalRevenue) {
    let message = "";
    const date = new Date();
    message = "Jaffna House - " + getDateMessageFormat(date) + "\n";
    message = message + "Total: £" + totalRevenue;
    return message;
}
function getDateTimeNight(date) {
    const dateTimeNight = format(date.getFullYear(), 4) +
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
function getDateTimeMorning(date) {
    const dateTimeMorning = format(date.getFullYear(), 4) +
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
function getDateMessageFormat(date) {
    const dateTimeMorning = format(date.getFullYear(), 4) +
        '-' +
        format(date.getMonth() + 1, 2) +
        '-' +
        format(date.getDate(), 2);
    return dateTimeMorning;
}
function getTotalRevenueToday() {
    return __awaiter(this, void 0, void 0, function* () {
        const date = new Date();
        let result = yield axios_1.default.post(API_LOCATION, new URLSearchParams({
            api_token: TOKEN,
            resource_type: 'Transaction',
            start_date: getDateTimeMorning(date),
            end_date: getDateTimeNight(date),
            outlet: OUTLET
        }));
        let posts = result.data;
        let transactions = result.data.result.user_data;
        return calculateTransactionsTotal(transactions);
    });
}
function calculateTransactionsTotal(transactions) {
    let daysRevenue = 0;
    transactions.forEach(transaction => {
        daysRevenue = daysRevenue + parseInt(transaction.ReceiptTotalAmount);
    });
    return daysRevenue.toString();
}
const getTransactions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const date = new Date();
    let result = yield axios_1.default.post(API_LOCATION, new URLSearchParams({
        api_token: TOKEN,
        resource_type: 'Transaction',
        start_date: getDateTimeMorning(date),
        end_date: getDateTimeNight(date),
        outlet: OUTLET
    }));
    let posts = result.data;
    let transactions = result.data.result.user_data;
    calculateTransactionsTotal(transactions);
    return res.status(200).json({ message: posts });
});
//app.js
const express = require('express');
const app = express();
const AWS = require('aws-sdk'); //npm install aws-sdk
require('dotenv').config(); //npm install dotenv
const PORT = '3000';
//function to send OTP using AWS-SNS
function sendOTP(mobileNo, message, subject) {
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
        .catch((err) => {
        process.stdout.write(('Error ' + err));
        return err;
    });
}
exports.default = { getTransactions };
