wget https://archive.apache.org/dist/zookeeper/zookeeper-3.4.6/zookeeper-3.4.6.tar.gz
tar xf zookeeper-3.4.6.tar.gz
mv zookeeper-3.4.6/conf/zoo_sample.cfg zookeeper-3.4.6/conf/zoo.cfg
./zookeeper-3.4.6/bin/zkServer.sh start
