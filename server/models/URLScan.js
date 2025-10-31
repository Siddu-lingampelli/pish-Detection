import mongoose from 'mongoose';

const urlScanSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  result: {
    type: String,
    required: true,
    enum: ['Legit', 'Suspicious', 'Phishing'],
    default: 'Suspicious'
  },
  confidence_score: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0
  },
  meta_data: {
    domain_age: {
      type: String,
      default: 'Unknown'
    },
    has_ssl: {
      type: Boolean,
      default: false
    },
    keywords: {
      type: [String],
      default: []
    },
    threat_types: {
      type: [String],
      default: []
    },
    risk_factors: {
      type: [String],
      default: []
    },
    ip_address: {
      type: String,
      default: 'Unknown'
    },
    domain_length: {
      type: Number,
      default: 0
    },
    has_suspicious_chars: {
      type: Boolean,
      default: false
    }
  },
  scan_duration: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
urlScanSchema.index({ url: 1, created_at: -1 });
urlScanSchema.index({ result: 1 });
urlScanSchema.index({ created_at: -1 });

const URLScan = mongoose.model('URLScan', urlScanSchema);

export default URLScan;
