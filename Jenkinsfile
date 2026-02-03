pipeline {
    agent any

    environment {
        // 1. Tên ảnh trên Docker Hub (Sửa lại tên của bạn nếu cần)
        DOCKER_IMAGE = 'huypro1123/donation-backend'
        
        // 2. ID đăng nhập Docker Hub
        REGISTRY_CRED = 'dockerhub-login'
        
        // 3. Lấy nội dung file .env từ cái "két sắt" bạn vừa tạo
        ENV_CONTENT = credentials('env-file')
    }

    stages {
        stage('Build & Push Docker') {
            steps {
                script {
                    echo "--- BẮT ĐẦU BUILD & PUSH ---"
                    docker.withRegistry('', REGISTRY_CRED) {
                        // Build ảnh
                        def app = docker.build("$DOCKER_IMAGE:latest")
                        // Đẩy lên Docker Hub
                        app.push()
                    }
                }
            }
        }

        stage('Deploy to Server') {
            steps {
                script {
                    echo "--- BẮT ĐẦU DEPLOY ---"
                    
                    // 1. Tạo file .env thật từ nội dung bí mật
                    sh 'echo "$ENV_CONTENT" > .env'
                    
                    // 2. Kéo code mới nhất từ Docker Hub về
                    sh "docker compose pull"
                    
                    // 3. Tắt cái cũ đi và chạy cái mới lên
                    // -d: chạy ngầm, --remove-orphans: dọn dẹp container thừa
                    sh "docker compose up -d --remove-orphans"
                    
                    // 4. Xóa ảnh rác cho sạch ổ cứng
                    sh "docker image prune -f"
                }
            }
        }
    }
}
