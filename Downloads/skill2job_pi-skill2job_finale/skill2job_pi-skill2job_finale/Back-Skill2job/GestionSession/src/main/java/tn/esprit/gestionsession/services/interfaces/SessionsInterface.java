package tn.esprit.gestionsession.services.interfaces;
import tn.esprit.gestionsession.entities.Sessions;

import java.util.List;

public interface SessionsInterface {
    Sessions addSession(Sessions session);
    void removeSession(Long id);
    void updateSession(Sessions session, Long id);
    List<Sessions> getSessions();
    public Sessions joinSession(Long sessionId, Long userId);
    Sessions leaveSession(Long sessionId, Long userId);
    Sessions getSessionById(Long id);
}
