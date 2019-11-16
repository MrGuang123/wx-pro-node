### 破TravisCI折磨死我了
1. 使用免密登录服务器，Travis帮你加密：travis encrypt-file ~/.ssh/***-rsa --add
2. 使用这个命令之前你需要有一个.travis.yml配置文件,然后会给你添加一个类似以下这样的命令
```bash
before_install:
- openssl aes-256-cbc -K $encrypted_fc32dcfc7826_key -iv $encrypted_fc32dcfc7826_iv
  -in huahua-rsa.enc -out ~\/.ssh/huahua-rsa -d

```
3. 千万记住把波浪线后面那个转义斜线去掉，我被坑了好几个小时，找了各种办法，最后发现坑在这
4. 如果不想执行npm test  记得添加一行script: true，或者你定义了test方法