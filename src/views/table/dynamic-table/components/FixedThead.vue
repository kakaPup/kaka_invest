<template>
  <div class="chat-window">
    <div class="chat-header">
      <h2>Chat</h2>
    </div>
    <div ref="chatMessages" class="chat-messages">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['message', msg.isUser? 'user-message' : 'bot-message']"
      >
        <!-- 根据消息是否是用户发送来调整结构顺序及添加对齐相关类 -->
        <span v-if="msg.isUser" class="message-text user-text-right">{{ msg.text }}</span>
        <img v-if="msg.isUser" :src="msg.avatar" class="message-avatar user-avatar-right" alt="Avatar">
        <img v-if="!msg.isUser" :src="msg.avatar" class="message-avatar bot-avatar-left" alt="Avatar">
        <span v-if="!msg.isUser" class="message-text bot-text-left">{{ msg.text }}</span>
      </div>
    </div>
    <div class="chat-input-section">
      <input
        v-model="userInput"
        type="text"
        placeholder="输入你的消息..."
        class="chat-input"
      >
      <button class="send-button" @click="sendMessage">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      messages: [],
      userInput: ''
    }
  },
  methods: {
    sendMessage() {
      if (this.userInput.trim() === '') {
        return
      }
      const userMessage = {
        text: this.userInput,
        isUser: true,
        avatar: 'user-avatar.jpg'
      }
      this.messages.push(userMessage)
      // 模拟回复消息（这里简单用固定文本演示，实际可替换为真正的请求后端获取回复逻辑）
      setTimeout(() => {
        const botReply = {
          text: '这是一个示例回复',
          isUser: false,
          avatar: 'bot-avatar.jpg'
        }
        this.messages.push(botReply)
        // 滚动到最新消息位置
        this.$nextTick(() => {
          const chatMessages = this.$refs.chatMessages
          chatMessages.scrollTop = chatMessages.scrollHeight
        })
      }, 500)
      this.userInput = ''
    }
  }
}
</script>

<style scoped>
/* 整体聊天窗口样式 */
.chat-window {
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  background-color: #fff;
  font-family: Arial, sans-serif;
}

/* 聊天窗口头部样式 */
.chat-header {
  background-color: #007bff;
  color: #fff;
  padding: 15px;
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}

/* 消息显示区域样式 */
.chat-messages {
  height: 300px;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 自定义滚动条样式 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-track {
  background-color: #f1f1f1;
  border-radius: 5px;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #ccc;
  border-radius: 5px;
}

/* 每条消息通用样式 */
.message {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  word-break: break-word;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease-in-out;
}
.message:hover {
  background-color: #f4f4f4;
}

/* 用户发送消息样式 */
.user-message {
  background-color: #dcf8c6;
  align-self: flex-end;
  justify-content: flex-end;
}

/* 用户消息文本靠右对齐样式 */
.user-text-right {
  flex-grow: 1;
  text-align: right;
  margin-right: 0; /* 让文本尽量靠右，去除原有右侧间距 */
}

/* 用户头像靠右对齐样式 */
.user-avatar-right {
  margin-left: 10px;
  margin-right: -10px; /* 将头像往右侧再偏移一点，使其更靠近右边 */
}

/* 回复消息样式 */
.bot-message {
  background-color: #e0e0e0;
  align-self: flex-start;
  justify-content: flex-start;
}

/* 回复消息文本靠左对齐样式 */
.bot-text-left {
  flex-grow: 1;
  text-align: left;
}

/* 回复消息头像靠左对齐样式 */
.bot-avatar-left {
  margin-right: 10px;
}

/* 消息中头像样式 */
.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 消息文本样式 */
.message-text {
  line-height: 1.4;
}

/* 输入框区域样式 */
.chat-input-section {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f4f4f4;
  border-top: 1px solid #ccc;
}

/* 输入框样式 */
.chat-input {
  flex: 1;
  padding: 10px 15px;
  border: none;
  border-radius: 25px;
  background-color: #fff;
  outline: none;
  font-size: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease-in-out;
}
.chat-input:focus {
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
}

/* 发送按钮样式 */
.send-button {
  margin-left: 10px;
  padding: 10px 20px;
  border: none;
  border-radius: 25px;
  background-color: #007bff;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease-in-out;
}
.send-button:hover {
  background-color: #0056b3;
}
</style>
