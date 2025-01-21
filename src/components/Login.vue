<template>
    <el-form :model="loginForm" ref="loginForm" label-width="100px">
      <el-form-item label="Username" prop="username">
        <el-input v-model="loginForm.username" placeholder="Enter your username" />
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="Enter your password"
          show-password
          type="password"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">Login</el-button>
      </el-form-item>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </el-form>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "Login",
    data() {
      return {
        loginForm: {
          username: "",
          password: "",
        },
        errorMessage: "",
      };
    },
    methods: {
      async handleLogin() {
        try {

            const response = await axios.post(
                "https://app.larksuite.com.tw/api/src/login.php",
                {username: this.loginForm.username,password: this.loginForm.password},
                {headers: { 'Content-Type': 'application/json' }}
              );


          if (response.data.jwt) {
            this.$emit("login", response.data.jwt); 
          } else {
            this.errorMessage = "Login failed. Please check your credentials.";
          }
        } catch (error) {
          console.log(error)
          this.errorMessage = "An error occurred during login.";
        }
      },
    },
  };
  </script>
  
  <style>
  .error {
    color: red;
  }
  </style>
  