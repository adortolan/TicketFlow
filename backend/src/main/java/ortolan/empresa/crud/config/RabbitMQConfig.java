package ortolan.empresa.crud.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitAdmin;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    private static final Logger log = LoggerFactory.getLogger(RabbitMQConfig.class);
    private static final String ORDER_CREATED_QUEUE = "order.created";

    @Autowired(required = false)
    private ConnectionFactory connectionFactory;

    @PostConstruct
    public void init() {
        log.info("RabbitMQConfig initialized");
        if (connectionFactory != null) {
            log.info("ConnectionFactory is available: {}", connectionFactory.getClass().getName());
            try {
                var connection = connectionFactory.createConnection();
                log.info("RabbitMQ connection established successfully!");
                connection.close();
            } catch (Exception e) {
                log.error("Failed to establish RabbitMQ connection: {}", e.getMessage(), e);
            }
        } else {
            log.warn("ConnectionFactory is NOT available - RabbitMQ may not be configured");
        }
    }

    @Bean
    public Queue orderCreatedQueue() {
        log.info("Creating queue: {}", ORDER_CREATED_QUEUE);
        return QueueBuilder.durable(ORDER_CREATED_QUEUE).build();
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        log.info("Creating JSON message converter");
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        log.info("Creating RabbitTemplate with connection factory: {}", connectionFactory.getClass().getName());
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public RabbitAdmin rabbitAdmin(ConnectionFactory connectionFactory) {
        log.info("Creating RabbitAdmin with connection factory: {}", connectionFactory.getClass().getName());
        return new RabbitAdmin(connectionFactory);
    }
}