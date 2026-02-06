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
                    sh 'echo "$ENV_CONTENT" > .env'
                    sh "docker pull $DOCKER_IMAGE:latest"
                    sh "docker stop donation-backend || true"
                    sh "docker rm donation-backend || true"
                    sh """
                        docker run -d \
                        --name donation-backend \
                        --restart always \
                        -p 5000:5000 \
                        --env-file .env \
                        $DOCKER_IMAGE:latest
                    """
                    sh "docker image prune -f"
                }
            }
        }

        stage('Test Telegram') {
            steps {
                withCredentials([
                  string(credentialsId: 'telegram-token-moi', variable: 'BOT_TOKEN')
                ]) {
                    sh """
                      curl -s -X POST https://api.telegram.org/bot$BOT_TOKEN/sendMessage \
                        -d chat_id=6454380469 \
                        -d text="🧪 Test Telegram từ Jenkins"
                    """
                }
            }
        }
    }
}
