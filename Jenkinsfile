pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'giahuy1123/donation-backend'
        REGISTRY_CRED = 'dockerhub-login'
        
        ENV_CONTENT = credentials('env-file')
    }

    stages {
        stage('Build & Push Docker') {
            steps {
                script {
                    echo "--- BẮT ĐẦU BUILD & PUSH ---"
                    docker.withRegistry('', REGISTRY_CRED) {
                        def app = docker.build("$DOCKER_IMAGE:latest")
                        app.push()
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "--- BẮT ĐẦU DEPLOY THỦ CÔNG ---"
                    
                    // 1. Tạo file .env
                    sh 'echo "$ENV_CONTENT" > .env'
                    
                    // 2. Kéo ảnh mới về
                    sh "docker pull $DOCKER_IMAGE:latest"
                    
                    // 3. Tắt container cũ (nếu đang chạy) - thêm || true để không lỗi nếu chưa có
                    sh "docker stop donation-backend || true"
                    
                    // 4. Xóa container cũ
                    sh "docker rm donation-backend || true"
                    
                    // 5. Chạy container mới (Thay thế cho docker compose)
                    // -d: Chạy ngầm
                    // --name: Đặt tên cố định để lần sau còn xóa được
                    // -p 5000:5000: Mở cổng
                    // --env-file .env: Nạp cấu hình (Redis Cloud...)
                    sh """
                        docker run -d \
                        --name donation-backend \
                        --restart always \
                        -p 5000:5000 \
                        --env-file .env \
                        $DOCKER_IMAGE:latest
                    """
                    
                    // 6. Dọn dẹp
                    sh "docker image prune -f"
                }
            }
        }
    }

    post {
        success {
            // Thay số ID Telegram của bạn vào chỗ 123456789 (Nhớ để trong dấu nháy đơn)
            telegramSend message: "✅ NGON LÀNH!\n- Dự án: ${env.JOB_NAME}\n- Build số: #${env.BUILD_NUMBER}\n- Trạng thái: Thành công rực rỡ 🚀", chatId: 6454380469L
        }
        failure {
            // Thay số ID Telegram của bạn vào chỗ 123456789
            telegramSend message: "❌ TOANG RỒI!\n- Dự án: ${env.JOB_NAME}\n- Build số: #${env.BUILD_NUMBER}\n- Lỗi: Vào kiểm tra gấp!", chatId: 6454380469L
        }
    }
}
