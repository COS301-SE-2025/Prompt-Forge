package backend.service;

import com.promptforger.dto.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    
    private final JdbcTemplate jdbcTemplate;
    
    public DashboardService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    public List<TopPromptDTO> getTopPrompts() {
        // My dear move query logic here from controller
    }
}