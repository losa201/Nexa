// api/src/kafka.js
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'nexa-api',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092']
});

export default kafka.producer();
