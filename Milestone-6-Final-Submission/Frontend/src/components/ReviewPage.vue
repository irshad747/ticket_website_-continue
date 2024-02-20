<template>
  <div class="review-form-container">
    <h1>Write a Review</h1>
    <form @submit.prevent="submitReview">
      <div class="form-group">
        <label for="reviewContent">Review:</label>
        <textarea id="reviewContent" v-model="reviewContent" class="form-control" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn-primary">Submit Review</button>
    </form>
  </div>
</template>
<style scoped>
.review-form-container {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.375rem 0.75rem;
  margin: 0.375rem 0;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  cursor: pointer;
}
</style>
