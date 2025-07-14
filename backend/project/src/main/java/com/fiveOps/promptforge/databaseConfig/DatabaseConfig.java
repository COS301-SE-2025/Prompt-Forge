// // package com.fiveOps.promptforge.databaseConfig;

// // import java.sql.Connection;
// // import java.sql.SQLException;

// // import javax.sql.DataSource;

// // import org.springframework.boot.jdbc.DataSourceBuilder;
// // import org.springframework.context.annotation.Bean;
// // import org.springframework.context.annotation.Configuration;

// // import io.github.cdimascio.dotenv.Dotenv;

// // @Configuration
// // public class DatabaseConfig {

// //   @Bean
// //   public DataSource dataSource() {
// //     Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();

// //     String url = dotenv.get("DB_URL");
// //     String username = dotenv.get("DB_USER");
// //     String password = dotenv.get("DB_PASSWORD");

// //     DataSource dataSource =
// //         DataSourceBuilder.create()
// //             .url(url)
// //             .username(username)
// //             .password(password)
// //             .driverClassName("org.postgresql.Driver") // or your actual DB driver
// //             .build();

// //     // Test connection during startup
// //     try (Connection conn = dataSource.getConnection()) {
// //       if (conn != null && !conn.isClosed()) {
// //         System.out.println("Connected to DB");
// //       } else {
// //         System.err.println("DB connection is null or closed");
// //       }
// //     } catch (SQLException e) {
// //       System.err.println("DB connection failed: " + e.getMessage());
// //     }

// //     return dataSource;
// //   }
// // }


// package com.fiveOps.promptforge.databaseConfig;

// import java.sql.Connection;
// import java.sql.SQLException;

// import javax.sql.DataSource;

// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.boot.jdbc.DataSourceBuilder;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class DatabaseConfig {

//   @Value("${spring.datasource.jdbc-url:jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1}")
//   private String jdbcUrl;

//   @Value("${spring.datasource.username:sa}")
//   private String username;

//   @Value("${spring.datasource.password:}")
//   private String password;

//   @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
//   private String driverClassName;

//   @Bean
//   public DataSource dataSource() {
//     DataSource dataSource =
//         DataSourceBuilder.create()
//             .url(jdbcUrl)  // Spring Boot's DataSourceBuilder expects .url(), not .jdbcUrl()
//             .username(username)
//             .password(password)
//             .driverClassName(driverClassName)
//             .build();

//     // Test connection during startup
//     try (Connection conn = dataSource.getConnection()) {
//       if (conn != null && !conn.isClosed()) {
//         System.out.println("Connected to DB: " + jdbcUrl);
//       } else {
//         System.err.println("DB connection is null or closed");
//       }
//     } catch (SQLException e) {
//       System.err.println("DB connection failed: " + e.getMessage());
//     }

//     return dataSource;
//   }
// }

package com.fiveOps.promptforge.databaseConfig;

import java.sql.Connection;
import java.sql.SQLException;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DatabaseConfig {

  @Value("${spring.datasource.jdbc-url:jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1}")
  private String jdbcUrl;

  @Value("${spring.datasource.username:sa}")
  private String username;

  @Value("${spring.datasource.password:}")
  private String password;

  @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
  private String driverClassName;

  @Bean
  public DataSource dataSource() {
    System.out.println("Creating DataSource with URL: " + jdbcUrl);
    System.out.println("Driver: " + driverClassName);
    
    DataSource dataSource =
        DataSourceBuilder.create()
            .url(jdbcUrl)
            .username(username)
            .password(password)
            .driverClassName(driverClassName)
            .build();

    // Test connection during startup
    try (Connection conn = dataSource.getConnection()) {
      if (conn != null && !conn.isClosed()) {
        System.out.println("Connected to DB: " + jdbcUrl);
      } else {
        System.err.println("DB connection is null or closed");
      }
    } catch (SQLException e) {
      System.err.println("DB connection failed: " + e.getMessage());
    }

    return dataSource;
  }
}