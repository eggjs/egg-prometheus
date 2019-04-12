package com.alipay.sofa.rpc.protobuf;

public class NodeTRException extends Exception {
  public NodeTRException() {}

  public NodeTRException(String message) {
    super(message);
  }

  public NodeTRException(Throwable cause) {
    super(cause);
  }

  public NodeTRException(String message, Throwable cause) {
    super(message, cause);
  }
}
