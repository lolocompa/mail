document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    load_mailbox('inbox')
  });
  document.querySelector('#sent').addEventListener('click', () => {
    load_mailbox('sent')
  });
  document.querySelector('#archived').addEventListener('click', () => {
    load_mailbox('archive')
  });
  document.querySelector('#compose').addEventListener('click', compose_email);


  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');

})

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view_email').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

}



function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_email').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    emails.forEach(element => {
      const html = document.createElement("div");
      html.id = "email_div";

      html.innerHTML = `
        <h6>${element.sender}</h6>
        <h5>${element.subject}</h5>
        <p>${element.timestamp}</p>
      `;
      
      html.addEventListener("click", function() {
        email_id = element.id
        view_email(email_id);
      })

      if (element.read === false) {
        html.style.backgroundColor = "#d7d7d7";
      }

      document.querySelector("#emails-view").append(html);

    });
  });

}




function send_email(event){
  event.preventDefault();

  let recipients_value = document.querySelector("#compose-recipients").value;
  let subject_value = document.querySelector("#compose-subject").value;
  let body_value = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients_value,
      subject: subject_value,
      body: body_value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })

  load_mailbox('sent');


}




function view_email(id) {

  const content_container = document.createElement("div");
  content_container.id = "view_id";

  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: false
    })
  })

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#view_email').style.display = 'block';
  
  document.querySelector('#view_email').innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    email.read = false

    const html_element = document.createElement("div");
    html_element.id = "view_id";

    html_element.innerHTML = `
      <h5>from: ${email.sender}</h5>
      <h5>to: ${email.recipients}</h5>
      <h5>subject: ${email.subject}</h5>
      <p>timestamp: ${email.timestamp}</p>
      <hr>
      <p id="email_body">${email.body}</p>
    `;
    content_container.appendChild(html_element);
    

  });




  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(mail => {
    const button_container = document.createElement("div")
    button_container.id = "buttons"

    const archive = document.createElement("button")
    archive.className = "btn btn-sm btn-outline-secondary";
    archive.id = "archive";

    if (mail.archived === false) {
      archive.textContent = "Archive";
      archive.addEventListener("click", () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: true
          })
        });
        load_mailbox("archive");
      });
    }
    else {
      archive.textContent = "Unarchive";
      archive.addEventListener("click", () => {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              archived: false
          })
        });
        load_mailbox("archive");
      });
    }

    const reply = document.createElement("button");
    reply.id = "reply";
    reply.className = "btn btn-sm btn-outline-primary";
    reply.textContent = "reply";
    reply.addEventListener("click", function() {
      reply_email(id)
    })

    button_container.appendChild(archive);
    button_container.appendChild(reply);

    document.querySelector("#view_email").appendChild(content_container);
    document.querySelector("#view_email").appendChild(button_container);

  });
}





function reply_email(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#view_email').style.display = 'none';
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(mail => {
    recipients = mail.recipients
    subject = `re: ${mail.subject}`
    body = `on ${mail.timestamp} ${mail.sender} wrote: ${mail.body}`

    document.querySelector("#compose-recipients").value = recipients;
    document.querySelector("#compose-subject").value   = subject;
    document.querySelector("#compose-body").value = body;
  });
}
