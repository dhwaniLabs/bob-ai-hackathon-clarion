import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.incident import Incident
from app.models.report import Report
from app.models.alert import Alert
from app.models.asset import Asset

def generate_report(
    db: Session,
    report_type: str,
    title: str,
    incident_id: Optional[str] = None,
    notes: Optional[str] = None
) -> Report:
    """Generate structured reports for Commander and SOC analyst workflows."""
    now = datetime.utcnow()
    report_id = f"REP-{str(uuid.uuid4())[:6].upper()}"

    incident = None
    alerts = []
    if incident_id:
        incident = db.query(Incident).filter(Incident.id == incident_id).first()
        if incident:
            alerts = db.query(Alert).filter(Alert.incident_id == incident.id).all()

    summary_text = ""
    html_content = ""

    if report_type == "BLUF":
        bluf_body = incident.bluf_summary if incident and incident.bluf_summary else "No BLUF briefing available."
        summary_text = f"Commander BLUF Briefing for {incident.title if incident else 'Threat Activity'}"
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #0f172a; padding: 24px;">
            <div style="border-bottom: 3px solid #ef4444; padding-bottom: 16px; margin-bottom: 24px;">
                <span style="background: #ef4444; color: white; padding: 4px 10px; font-weight: bold; font-size: 12px; border-radius: 4px; text-transform: uppercase;">
                    FLASH COMMANDER BRIEFING
                </span>
                <h1 style="margin: 12px 0 4px; font-size: 26px; color: #0f172a;">{title}</h1>
                <p style="margin: 0; color: #64748b; font-size: 14px;">Generated: {now.strftime('%Y-%m-%d %H:%M:%S UTC')} | Clarion AI Defense Core</p>
            </div>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #ef4444; border-radius: 6px; padding: 18px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #991b1b; font-size: 16px; text-transform: uppercase;">Bottom Line Up Front (BLUF)</h3>
                <div style="white-space: pre-wrap; font-size: 15px; line-height: 1.6; color: #1e293b;">{bluf_body}</div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: bold; width: 30%;">Incident Identifier</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;">{incident.id if incident else 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: bold;">Calculated Threat Risk</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; font-weight: bold; color: #ef4444;">{incident.risk_score if incident else 0}/100 ({incident.priority if incident else 'UNKNOWN'})</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #cbd5e1; background: #f1f5f9; font-weight: bold;">Corroborating Feeds</td>
                    <td style="padding: 10px; border: 1px solid #cbd5e1;">{len(alerts)} alerts across multi-sensor network</td>
                </tr>
            </table>
            
            <div style="border-top: 1px solid #cbd5e1; padding-top: 12px; font-size: 12px; color: #94a3b8; text-align: center;">
                CONFIDENTIAL // CLASSIFIED OPERATIONS USE ONLY // CLARION DEFENSE ASSISTANT
            </div>
        </div>
        """

    elif report_type == "INCIDENT":
        summary_text = f"Full Technical Incident Report for {incident.id if incident else 'Security Incident'}"
        alert_rows = "".join([
            f"<tr><td style='padding:8px;border:1px solid #e2e8f0;'>{a.timestamp.strftime('%H:%M:%S')}</td>"
            f"<td style='padding:8px;border:1px solid #e2e8f0;'>{a.source}</td>"
            f"<td style='padding:8px;border:1px solid #e2e8f0;'>{a.event_type}</td>"
            f"<td style='padding:8px;border:1px solid #e2e8f0;'><strong>{a.severity.upper()}</strong></td>"
            f"<td style='padding:8px;border:1px solid #e2e8f0;'>{a.description}</td></tr>"
            for a in alerts[:10]
        ])
        
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; color: #0f172a; padding: 24px;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #1e3a8a;">SECURITY INCIDENT TECHNICAL DOSSIER: {incident.id if incident else 'INCIDENT'}</h1>
                <p style="color: #64748b; margin: 4px 0 0;">Priority: {incident.priority if incident else 'HIGH'} | Risk Score: {incident.risk_score if incident else 80}/100</p>
            </div>
            
            <h3>Correlated Attack Sequence ({len(alerts)} Events)</h3>
            <table style="width:100%; border-collapse: collapse; font-size: 13px;">
                <thead>
                    <tr style="background: #f1f5f9; text-align: left;">
                        <th style="padding: 8px; border: 1px solid #e2e8f0;">Time (UTC)</th>
                        <th style="padding: 8px; border: 1px solid #e2e8f0;">Source</th>
                        <th style="padding: 8px; border: 1px solid #e2e8f0;">Event Type</th>
                        <th style="padding: 8px; border: 1px solid #e2e8f0;">Severity</th>
                        <th style="padding: 8px; border: 1px solid #e2e8f0;">Details</th>
                    </tr>
                </thead>
                <tbody>
                    {alert_rows}
                </tbody>
            </table>

            <h3 style="margin-top: 24px;">Correlation Justification</h3>
            <div style="background: #f8fafc; padding: 14px; border: 1px solid #e2e8f0; border-radius: 4px;">
                <ul style="margin: 0; padding-left: 20px;">
                    {"".join(f"<li>{expl}</li>" for expl in (json.loads(incident.correlation_explanation) if incident and incident.correlation_explanation else ['Multi-source temporal clustering']))}
                </ul>
            </div>
        </div>
        """

    elif report_type == "DAILY_SUMMARY":
        summary_text = "Daily Operational Threat Activity & Posture Summary"
        total_alts = db.query(Alert).count()
        total_incs = db.query(Incident).count()
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #0f172a; padding: 24px;">
            <div style="border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 20px;">
                <h1 style="margin: 0; color: #0369a1;">DAILY THREAT ACTIVITY & DEFENSE POSTURE</h1>
                <p style="color: #64748b; margin: 4px 0 0;">Reporting Period: Last 24 Hours | Clarion SOC Intelligence</p>
            </div>
            <div style="display: flex; gap: 16px; margin-bottom: 24px;">
                <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px;">
                    <div style="font-size: 12px; color: #64748b;">TOTAL SIGNALS INGESTED</div>
                    <div style="font-size: 28px; font-weight: bold; color: #0284c7;">{total_alts:,}</div>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px;">
                    <div style="font-size: 12px; color: #64748b;">CORRELATED INCIDENTS</div>
                    <div style="font-size: 28px; font-weight: bold; color: #ef4444;">{total_incs}</div>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 6px;">
                    <div style="font-size: 12px; color: #64748b;">DEFENSE STATUS</div>
                    <div style="font-size: 28px; font-weight: bold; color: #16a34a;">ACTIVE DEFENSE</div>
                </div>
            </div>
            <p>Overall operational telemetry indicates sustained adversary targeting against command infrastructure. All identified high-risk clusters have been routed to analyst queues.</p>
        </div>
        """

    else:
        # MITRE / Analyst Investigation report fallback
        summary_text = f"{report_type} Report - Clarion Intelligence"
        html_content = f"""
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #0f172a; padding: 24px;">
            <h1 style="border-bottom: 2px solid #475569; padding-bottom: 12px;">{title}</h1>
            <p style="color: #64748b;">Type: {report_type} | Generated: {now.strftime('%Y-%m-%d %H:%M:%S UTC')}</p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 6px;">
                <p>Detailed intelligence findings compiled by Clarion defense analysis engine.</p>
                <p>{notes or 'Operational investigation underway across targeted asset subnets.'}</p>
            </div>
        </div>
        """

    rep = Report(
        id=report_id,
        title=title,
        report_type=report_type,
        incident_id=incident_id,
        generated_by="Analyst / Clarion Core",
        created_at=now,
        content_html=html_content,
        summary=summary_text
    )
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return rep
