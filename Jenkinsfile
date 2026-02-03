pipeline {
    agent any

    environment {
        // --- CẤU HÌNH CỦA BẠN (SỬA LẠI CHỖ NÀY) ---
        // Thay 'huypro184' bằng Username trên DOCKER HUB của bạn (không phải GitHub)
        DOCKER_IMAGE = 'giahuy1123/donation-backend' 
        
        // ID này phải giống hệt cái ID bạn điền trong mục Credentials lúc nãy
        REGISTRY_CRED = 'dockerhub-login'
    }

    stages {
        stage('Kiểm tra môi trường') {
            steps {
                // In ra phiên bản Docker để chắc chắn máy chủ đã sẵn sàng
                sh 'docker --version'
                echo "Bắt đầu build cho image: ${env.DOCKER_IMAGE}"
            }
        }

        stage('Build & Push Docker') {
            steps {
                script {
                    // Lệnh này tương đương: docker build -t huypro184/donation-backend:latest .
                    def app = docker.build("$DOCKER_IMAGE:latest")
                    
                    // Đăng nhập vào Docker Hub và đẩy ảnh lên
                    docker.withRegistry('', REGISTRY_CRED) {
                        app.push()
                    }
                }
            }
        }
    }
}
