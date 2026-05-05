import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#f0f2f5',
        padding: 0,
    },
    certificate: {
        width: '100%',
        height: '100%',
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden', // Ensures shapes don't cause scrollbars
    },
    shapeTopLeft: {
        position: 'absolute',
        top: -50,
        left: -50,
        width: 200,
        height: 200,
        backgroundColor: '#9ccc65',
        transform: 'rotate(45deg)',
    },
    shapeBottomRight: {
        position: 'absolute',
        bottom: -80,
        right: -80,
        width: 250,
        height: 250,
        backgroundColor: '#1a237e',
        transform: 'rotate(45deg)',
    },
    content: {
        padding: 40,
        border: '2px solid #eee',
        margin: 30,
        height: '85%',
        zIndex: 1,
    },
    platformName: {
        fontSize: 14,
        color: '#1a237e',
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 42,
        color: '#1a237e',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    subHeader: {
        backgroundColor: '#9ccc65',
        color: '#ffffff',
        fontSize: 13,
        textAlign: 'center',
        padding: 8,
        width: 180,
       
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: 10,
        marginBottom: 20,
    },
    recipientText: {
        fontSize: 12,
        color: '#555',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    nameContainer: {
        textAlign: 'center',
        borderBottom: '2px solid #1a237e',
        alignSelf: 'center', // Centers the container itself
        marginBottom: 10,
        paddingBottom: 5,
    },
    recipientName: {
        fontSize: 30,
        color: '#1a237e',
        fontFamily: 'Times-Roman',
        marginBottom: 10,
    },
    courseText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    courseName: {
        fontSize: 18,
        color: '#1a237e',
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 30,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end', // Aligns signature and QR horizontally
        marginTop: 'auto', // Pushes footer to bottom of content area
        paddingHorizontal: 20,
    },
    sigBlock: {
        width: 200,
        alignItems: 'center',
        textAlign: 'center',
    },
    sigName: {
        fontSize: 22,
        //   fontFamily: 'Times-Italic',
        // fontFamily: 'Helvetica-Oblique',
        fontFamily: 'Courier-Oblique',  
        color: '#1a237e',
        marginBottom: 5,
    },
    sigTitle: {
        fontSize: 9,
        color: '#666',
        marginTop: 2,
    },
    sigLine: {
        width: '100%',
        height: 1,
        backgroundColor: '#999',
        marginBottom: 5,
    },
    certDetails: {
        textAlign: 'center',
        fontSize: 9,
        color: '#666',
        marginBottom: 10,
    },
    qrBlock: {
        alignItems: 'center',
        width: 100,
    },
    qrImage: {
        width: 80, // Increased size
        height: 80,
        marginBottom: 5,
    },
    qrText: {
        fontSize: 8,
        color: '#666',
    },
    footerText: {
        fontSize: 9,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
    },
});

const CertificatePDF = ({ userName, courseName, certificateId, issueDate, qrCode }) => (
    <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
            <View style={styles.certificate}>
                <View style={styles.shapeTopLeft} />
                <View style={styles.shapeBottomRight} />
                <View style={styles.content}>
                    <Text style={styles.platformName}>SMARTLEARNING</Text>
                    <Text style={styles.tagline}>India's Trusted Learning Platform</Text>
                    <Text style={styles.title}>CERTIFICATE</Text>
                    <Text style={styles.subHeader}>OF COMPLETION</Text>

                    <Text style={styles.recipientText}>This certificate is proudly presented to</Text>
                    <View style={styles.nameContainer}>
                        <Text style={styles.recipientName}>{userName}</Text>
                    </View>

                    <Text style={styles.courseText}>for successfully completing the course</Text>
                    <Text style={styles.courseName}>{courseName}</Text>

                    <View style={styles.footer}>
                        <View style={styles.sigBlock}>
                            <Text style={styles.sigName}>Sudha Kumari</Text>
                            <Text style={styles.sigTitle}>Founder & CEO</Text>
                        </View>

                        <View style={styles.certDetails}>
                            <Text>Certificate No: {certificateId}</Text>
                            <Text>Issue Date: {issueDate}</Text>
                        </View>

                        <View style={styles.qrBlock}>
                            <Image src={qrCode} style={styles.qrImage} />
                            <Text style={styles.qrText}>Scan to Verify</Text>
                        </View>
                    </View>

                    <Text style={styles.footerText}>✨ SmartLearning — Empowering Education, Transforming Lives ✨</Text>
                </View>
            </View>
        </Page>
    </Document>
);

export default CertificatePDF;