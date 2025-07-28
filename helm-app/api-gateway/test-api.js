const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// 🔧 Config
const TOTAL_REQUESTS = 200;
const CONCURRENCY = 10;
const API_URL = 'http://localhost:30081/land/register';

// 🧠 Utilities for randomness
const firstNames = ['Juan', 'Maria', 'Jose', 'Liza', 'Carlo', 'Ana', 'Mico', 'Grace', 'Bobby', 'Faith'];
const lastNames = ['Dela Cruz', 'Reyes', 'Garcia', 'Santos', 'Morales', 'Torres', 'Navarro', 'Tan'];

const getRandomName = () => {
  const first = firstNames[Math.floor(Math.random() * firstNames.length)];
  const last = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${first} ${last}`;
};

const getRandomNumber = () => Math.floor(100000000 + Math.random() * 900000000);
const getRandomIndexSuffix = (i) => String(i).padStart(3, '0');

// 📄 Prepare form data per request
function createForm(index) {
  const name = getRandomName();
  const suffix = getRandomIndexSuffix(index);

  const form = new FormData();
  form.append('owner_name', name);
  form.append('contact_no', `09${getRandomNumber()}`);
  form.append('email_address', `${name.toLowerCase().replace(/ /g, '')}${suffix}@example.com`);
  form.append('address', `Blk ${index}, Brgy. Mabuhay, QC`);
  form.append('title_number', `AUTO${suffix}`);
  form.append('property_location', 'Makati');
  form.append('lot_number', `${index}`);
  form.append('survey_number', `SURV${suffix}`);
  form.append('area_size', '500');
  form.append('classification', 'Residential');
  form.append('registration_date', '2023-07-28');
  form.append('registrar_office', 'Makati');
  form.append('previous_title_number', `PREV${suffix}`);
  form.append('encumbrances', 'None');
  form.append('status', 'Active');

  // 📎 Attachment
  const filePath = path.join(__dirname, 'sample-files', 'title-deed.pdf');
  form.append('attachments', fs.createReadStream(filePath));

  return form;
}

// 🚀 Send a single request
async function sendRequest(i) {
  const form = createForm(i);
  try {
    const response = await axios.post(API_URL, form, {
      headers: form.getHeaders(),
    });
    console.log(`✅ [${i}]`, response.data.message);
  } catch (err) {
    console.error(`❌ [${i}]`, err.response?.data || err.message);
  }
}

// 🧠 Controlled concurrency
async function run() {
  const queue = [];
  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    queue.push(sendRequest(i));
    if (queue.length >= CONCURRENCY) {
      await Promise.all(queue);
      queue.length = 0;
    }
  }

  if (queue.length > 0) {
    await Promise.all(queue);
  }

  console.log('🎉 All requests sent!');
}

run();
