<template>
  <NavBar :title="ticket_details.subject_name" isSubject="true"></NavBar>
  <div class="container mt-4">
    <!-- Question Card -->
    <div class="card shadow-sm mb-4">
      <div class="card-header d-flex justify-content-between align-items-center" :class="{
          'bg-success text-white': ticket_details.ticket_status === 'resolved',
          'bg-warning text-dark': ticket_details.ticket_status === 'unresolved',
        }">
        <span>{{ ticket_details.title }}</span>
        <span class="badge" :class="{
          'bg-success': ticket_details.isFAQ,
          'bg-secondary': !ticket_details.isFAQ,
        }">FAQ</span>
      </div>
      <div class="card-body">
        <p>{{ ticket_details.description }}</p>
        <div class="mt-3">
          <span class="badge bg-primary me-2">{{ ticket_details.sec_name }}</span>
          <span class="badge" :class="{
  'bg-success': ticket_details.ticket_status === 'resolved',
  'bg-danger': ticket_details.ticket_status === 'unresolved',
}">{{ capitalize(ticket_details.ticket_status) }}</span>

        </div>
      </div>
      <div class="card-footer d-flex justify-content-between align-items-center">
        <div>
          <i @click="like(ticket_details.ticket_id)" class="bi" :class="[
            isLiked ? 'bi-hand-thumbs-up-fill text-primary' : 'bi-hand-thumbs-up',
          ]" style="cursor: pointer; font-size: 1.5rem;"></i>
          <span class="ms-2">{{ likes }}</span>
        </div>
        <!-- New Buttons -->
        <div>
          <button @click="markAsResolved" class="btn btn-success me-2" v-if="ticket_details.ticket_status !== 'resolved'">Mark as Resolved</button>
          <button @click="goToDiscourse" class="btn btn-secondary me-2">Go to Discourse</button>
         <button @click="writeReview" class="btn btn-info">GChat</button>
         <button @click="newReview" class="btn btn-info">Write a Review</button>


        </div>
      </div>
    </div>

    <!-- Responses Section -->
    <div>
      <h5>Responses:</h5>
      <div v-for="response in response_list" :key="response.id" class="card mb-3">
        <div class="card-body">
          {{ response.response }}
          <footer class="blockquote-footer">Posted by: {{ response.username }}</footer>
        </div>
      </div>
    </div>

    <!-- Add Response Form -->
    <div v-if="ticket_details.ticket_status === 'unresolved'">
      <h5>Add Response:</h5>
      <form @submit.prevent="AddResponse">
        <textarea v-model="response_text" class="form-control mb-2" placeholder="Your response..."></textarea>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    </div>
  </div>
</template>
<script>
import NavBar from "@/components/NavBar.vue";
import router from '@/router';

export default {

  name: "TicketView",
  components: { NavBar },
  data: function () {
    return {
      current_user_id: parseInt(localStorage.getItem("user_id")),
      username: "",
      response_text: "",
      ticket_details: {},
      response_list: [],
      likes: 0,
      isLiked: false,
      true_response: "",
      duplicate: false,
      role: "student"
    };
  },

  methods: {
    AddResponse() {
      if (!this.response_text.trimStart()) {
        alert("Empty response body is not allowed.")
      }
      else {
        fetch(`http://127.0.0.1:5500/api/response/${this.$route.params.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: "Bearer " + localStorage.getItem("access_token"),
          },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            response: this.response_text.trimStart(),
          }),
        })
          .then((response) => {
            if (!response.ok) {
              alert("Error occured while adding response");
            }
            return response.json();
          })
          .then((data) => {
            console.log(data);
            if (data) {
              // Send Notification to the ticket author abt new response
              fetch(`http://127.0.0.1:5500/notify/student`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  Authorization: "Bearer " + localStorage.getItem("access_token"),
                },
                body: JSON.stringify({
                  username: this.username,
                  ticket_id: this.$route.params.id,
                })
              })
              window.location.reload();
            } else {
              this.response_text = null;
            }
          })
          .catch((err) => {
            console.log(err);
            this.response_text = null;
          });
      }
    },
    capitalize(text) {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
  newReview(){
    // Redirect to Review Page Component
    this.$router.push({ name: 'ReviewPage', params: { ticketId: this.ticket_details.ticket_id } });
  },
  async writeReview() {
    // Example message to send
    const message = 'Congratulations guyz webhook has been integrated i am signing off now';

    try {
      const response = await fetch('http://localhost:3000/send-to-gchat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('Message successfully sent to Google Chat.');
      } else {
        console.error('Failed to send message to Google Chat.');
      }
    } catch (error) {
      console.error('Error sending message to Google Chat:', error);
    }
  },
    like(id) {
      this.isLiked ? (this.likes -= 1) : (this.likes += 1),
        (this.isLiked = !this.isLiked);
      fetch(`http://127.0.0.1:5500/api/subject/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          action: "like",
          user_id: parseInt(this.current_user_id),
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Error occured while liking this ticket");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
        })
        .catch((err) => console.log(err));
    },
    Delete(id) {

      fetch(`http://127.0.0.1:5500/api/subject/ticket/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
      })
        .then((response) => {
          if (!response.ok) {
            alert("Error occured while deleting this ticket");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);
          router.push(`/subject/${this.ticket_details.subject_name}`)
        })
        .catch((err) => console.log(err));
    },
    MarkAnswer(ticket_id, res_id) {
      fetch(`http://127.0.0.1:5500/api/response/${ticket_id}/${res_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          isAnswer: true,
          ticket_status: "resolved",
        }),
      })
        .then((response) => {
          if (!response.ok) {
            alert("Error occurred while marking response as answer");
          }
          return response.json();
        })
        .then((data) => {
          console.log(data);

          this.ticket_details.ticket_status = "resolved";

          for (let response of this.response_list) {
            if (response.response_id == res_id) {
              response.isAnswer = true;
              this.true_response = response.response
            } else {
              response.isAnswer = false;
            }
          }

          console.log(this.response_list);
        })
        .catch((err) => console.log(err));
    },
    MarkFAQ(id) {
      fetch(`http://127.0.0.1:5500/api/subject/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          action: "faq",
          user_id: parseInt(this.current_user_id),
        }),
      })
        .then((response) => {

          return response.json();
        }
        )
        .then((data) => {
          if (data.error_code) {
            alert(data.error_message)
          }
          else {
            this.ticket_details.isFAQ = true
          }

        })
        .catch((err) => console.log(err));
    },
    UnMarkFAQ(id) {
      fetch(`http://127.0.0.1:5500/api/subject/ticket/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({
          action: "notfaq",
          user_id: parseInt(this.current_user_id),
        }),
      })
        .then((response) => {

          return response.json();
        }
        )
        .then((data) => {
          if (data.error_code) {
            alert(data.error_message)
          }
          else {
            this.ticket_details.isFAQ = false
          }
        })
        .catch((err) => console.log(err));
    },
    MarkDuplicate(id) {
      let title = prompt("Please input the url of original ticket");
      if (title) {
        fetch(`http://127.0.0.1:5500/api/response/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            Authorization: "Bearer " + localStorage.getItem("access_token"),
          },
          body: JSON.stringify({
            user_id: localStorage.getItem("user_id"),
            response: "Duplicate ticket, Original thread link: " + title,
          }),
        })
          .then(response => response.json())
          .then((data) => {
            if (data.error_code) {
              alert(data.error_message)
            }
            else {
              this.duplicate = true
              this.response_list = data.response_list
              const index = this.response_list.findIndex(item => item.response.includes('Duplicate ticket'));
              const res_id = parseInt(this.response_list[index].response_id)
              fetch(`http://127.0.0.1:5500/api/response/${this.ticket_details.ticket_id}/${res_id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  "Access-Control-Allow-Origin": "*",
                  Authorization: "Bearer " + localStorage.getItem("access_token"),
                },
                body: JSON.stringify({
                  isAnswer: true,
                  ticket_status: "resolved",
                }),
              })
                .then((response) => {
                  if (!response.ok) {
                    alert("Error occurred while marking as duplicate");
                  }
                  return response.json();
                })
                .then((data) => {
                  console.log(data);
                  window.location.reload()
                })
                .catch((err) => console.log(err));
            }
          })
          .catch((err) => console.log(err));
      }
    },
  },
  beforeMount: function () {
    if (localStorage.getItem('access_token') == null) {
      alert('Please Login First.')
      return router.push('/')
    }
    this.username = localStorage.getItem("username");
    this.role = localStorage.getItem("role")
    fetch(`http://127.0.0.1:5500/api/response/${this.$route.params.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
    })
      .then((response) => {
        if (!response.ok) {
          alert("Error occurred while retrieving data.");
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);

        if (this.role == 'staff') {
          if (data.subject_name !== localStorage.getItem("subject_name")) {
            alert("You are accessing other subject ticket")
            router.push(`/subject/${localStorage.getItem("subject_name")}`)
          }
        }
        this.ticket_details = data;
        this.response_list = data.response_list;
        this.likes = this.ticket_details.likes.length;
        this.isLiked = this.ticket_details.likes.includes(this.current_user_id);
        const answer = this.response_list[this.response_list.findIndex(
          (response) => response.isAnswer == true
        )];
        const index = this.response_list.findIndex(item => item.response.includes('Duplicate ticket'));
        if (index != -1) {
          this.duplicate = true
        }

        this.true_response = answer.response
      })
      .catch((err) => console.log(err));
  },
};
</script>
<style scoped>
.txt-button {
  background-color: #6b62ff;
}

.txt-color {
  color: #6b62ff;
}
</style>