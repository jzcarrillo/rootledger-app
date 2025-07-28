const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

(async () => {
  const form = new FormData();

  // Add form fields
  form.append('owner_name', 'Juan Dela Cruz');
  form.append('contact_no', '09171234567');
  form.append('email_address', 'juan@example.com');
  form.append('address', '123 Main St, Quezon City');
  form.append('title_number', 'T-000123');
  form.append('property_location', 'Quezon City');
  form.append('lot_number', '456');
  form.append('survey_number', 'S-78910');
  form.append('area_size', '250');
  form.append('classification', 'Residential');
  form.append('status', 'Active');
  form.append('registration_date', '2024-05-01');
  form.append('registrar_office', 'Quezon City');
  form.append('previous_title_number', 'T-000100');
  form.append('encumbrances', 'No known encumbrances');

  // Add a fake attachment
  const dummyFilePath = path.join(__dirname, 'dummy.txt');
  fs.writeFileSync(dummyFilePath, 'Hello, this is a test file.');

  form.append('attachments', fs.createReadStream(dummyFilePath));

  try {
    const res = await axios.post('http://localhost:4000/register', form, {
      headers: form.getHeaders(),
      maxBodyLength: Infinity,
    });

    console.log('[✓] Success:', res.data);
  } catch (err) {
    if (err.response) {
      console.error('[✗] Error Response:', err.response.status, err.response.data);
    } else {
      console.error('[✗] Error:', err.message);
    }
  } finally {
    // Clean up dummy file
    fs.unlinkSync(dummyFilePath);
  }
})();
